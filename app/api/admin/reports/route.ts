import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/jwt-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get("type") || "overview";
    const period = searchParams.get("period") || "30j";
    const region = searchParams.get("region") || "all";
    const service = searchParams.get("service") || "all";
    const startDate = searchParams.get("startDate") || null;
    const endDate = searchParams.get("endDate") || null;

    // Calculate date range based on period
    const today = new Date();
    let fromDate = new Date();

    switch (period) {
      case "7j":
        fromDate.setDate(today.getDate() - 7);
        break;
      case "30j":
        fromDate.setDate(today.getDate() - 30);
        break;
      case "90j":
        fromDate.setDate(today.getDate() - 90);
        break;
      case "1a":
        fromDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        fromDate.setDate(today.getDate() - 30);
    }

    // Use custom date range if provided
    if (startDate && endDate) {
      fromDate = new Date(startDate);
      today.setTime(new Date(endDate).getTime());
    }

    // Fetch data based on report type
    let data = {};

    if (reportType === "overview" || reportType === "performance") {
      // Fetch orders data with status counts
      const orders = await prisma.commande.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lte: today,
          },
          ...(region !== "all" && { region: region }),
          ...(service !== "all" && { serviceType: service }),
        },
        include: {
          client: true,
          agent: true,
          produits: true,
        },
      });

      // Calculate KPIs
      const totalOrders = orders.length;
      const onTimeDeliveries = orders.filter(
        (order) =>
          order.statut === "Livrée" &&
          new Date(order.dateCommande || "") <= new Date(order.updatedAt || "")
      ).length;

      const onTimeRate =
        totalOrders > 0 ? (onTimeDeliveries / totalOrders) * 100 : 0;

      // Calculate average delivery time
      const deliveredOrders = orders.filter(
        (order) => order.statut === "Livrée" && order.dateCommande
      );
      let avgDeliveryTime = 0;

      if (deliveredOrders.length > 0) {
        const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
          const createdAt = new Date(order.createdAt);
          const deliveredAt = new Date(order.updatedAt || "");
          return (
            sum +
            (deliveredAt.getTime() - createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
          ); // in days
        }, 0);

        avgDeliveryTime = totalDeliveryTime / deliveredOrders.length;
      }

      // Get status distribution
      const statusCounts = {
        pending: orders.filter((order) => order.statut === "En attente").length,
        inProgress: orders.filter((order) => order.statut === "Expédiée")
          .length,
        delivered: orders.filter((order) => order.statut === "Livrée").length,
        cancelled: orders.filter((order) => order.statut === "Annulée").length,
      };

      // Get agent performance
      const agentPerformance = [];
      const agentMap = new Map();

      orders.forEach((order) => {
        if (order.agent) {
          const agentId = order.agent.id;
          if (!agentMap.has(agentId)) {
            agentMap.set(agentId, {
              name: `${order.agent.nom} ${order.agent.prenom.charAt(0)}.`,
              completed: 0,
              pending: 0,
              total: 0,
              efficiency: 0,
            });
          }

          const agent = agentMap.get(agentId);
          agent.total++;

          if (order.statut === "DELIVERED") {
            agent.completed++;
          } else {
            agent.pending++;
          }
        }
      });

      agentMap.forEach((agent) => {
        agent.efficiency =
          agent.total > 0 ? (agent.completed / agent.total) * 100 : 0;
        agentPerformance.push(agent);
      });

      // Sort by efficiency
      agentPerformance.sort((a, b) => b.efficiency - a.efficiency);

      data = {
        kpis: {
          onTimeRate,
          avgDeliveryTime,
          agentEfficiency:
            agentPerformance.length > 0
              ? agentPerformance.reduce(
                  (sum, agent) => sum + agent.efficiency,
                  0
                ) / agentPerformance.length
              : 0,
          errorRate:
            totalOrders > 0
              ? (orders.filter((order) => order.hasIssue).length /
                  totalOrders) *
                100
              : 0,
        },
        statusDistribution: statusCounts,
        agentPerformance: agentPerformance.slice(0, 6), // Top 6 agents
        monthlyTrends: await getMonthlyTrends(fromDate, today),
        deliveryTimeDistribution: getDeliveryTimeDistribution(deliveredOrders),
      };
    }

    if (reportType === "financial" || reportType === "overview") {
      // Fetch financial data
      const invoices = await prisma.facture.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lte: today,
          },
          ...(service !== "all" && { serviceType: service }),
        },
        include: {
          commande: {
            include: {
              client: true,
            },
          },
          paiement: true,
        },
      });

      const totalRevenue = invoices.reduce(
        (sum, invoice) => sum + invoice.montant,
        0
      );

      const paidInvoices = invoices.filter((invoice) => {
        const payments = Array.isArray(invoice.paiement)
          ? invoice.paiement
          : [];
        const totalPaid = payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        return totalPaid >= invoice.montant;
      });

      const paidAmount = paidInvoices.reduce(
        (sum, invoice) => sum + invoice.montant,
        0
      );
      const unpaidAmount = totalRevenue - paidAmount;

      // Payment method distribution
      const paymentMethods = await prisma.paiement.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lte: today,
          },
        },
        select: {
          modePaiement: true,
          montant: true,
        },
      });

      const paymentMethodDistribution = {};
      let totalPaymentAmount = 0;

      paymentMethods.forEach((payment) => {
        totalPaymentAmount += payment.montant;
        if (!paymentMethodDistribution[payment.modePaiement]) {
          paymentMethodDistribution[payment.modePaiement] = 0;
        }
        paymentMethodDistribution[payment.modePaiement] += payment.montant;
      });

      // Convert to percentages
      Object.keys(paymentMethodDistribution).forEach((method) => {
        paymentMethodDistribution[method] =
          (paymentMethodDistribution[method] / totalPaymentAmount) * 100;
      });

      // Top clients by revenue
      const clientRevenue = {};

      invoices.forEach((invoice) => {
        if (invoice.commande?.client) {
          const clientId = invoice.commande.client.id;
          const clientName = `${invoice.commande.client.nom} ${invoice.commande.client.prenom}`;

          if (!clientRevenue[clientId]) {
            clientRevenue[clientId] = {
              name: clientName,
              revenue: 0,
            };
          }

          clientRevenue[clientId].revenue += invoice.montant;
        }
      });

      const topClients = Object.values(clientRevenue)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      // Monthly revenue trends
      const monthlyRevenue = await getMonthlyRevenue(fromDate, today);

      // Service revenue distribution
      const serviceRevenue = {};

      invoices.forEach((invoice) => {
        if (invoice.commande?.typeCommande) {
          const service = invoice.commande.serviceType;

          if (!serviceRevenue[service]) {
            serviceRevenue[service] = 0;
          }

          serviceRevenue[service] += invoice.montant;
        }
      });

      // Convert to percentages
      const totalServiceRevenue = Object.values(serviceRevenue).reduce(
        (sum: any, val: any) => sum + val,
        0
      );

      Object.keys(serviceRevenue).forEach((service) => {
        serviceRevenue[service] = {
          amount: serviceRevenue[service],
          percentage: (serviceRevenue[service] / totalServiceRevenue) * 100,
        };
      });

      data = {
        ...data,
        financial: {
          totalRevenue,
          paidAmount,
          unpaidAmount,
          paymentRate: totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0,
          invoiceCount: invoices.length,
          paidInvoiceCount: paidInvoices.length,
          paymentMethodDistribution,
          topClients,
          monthlyRevenue,
          serviceRevenue,
        },
      };
    }

    if (reportType === "logistics" || reportType === "overview") {
      // Fetch logistics data
      const shipments = await prisma.shipment.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lte: today,
          },
          ...(region !== "all" && { region: region }),
          ...(service !== "all" && { transportMode: service }),
        },
        include: {
          warehouse: true,
        },
      });

      // Transport mode distribution
      const transportModes = {};

      shipments.forEach((shipment) => {
        if (!transportModes[shipment.transportMode]) {
          transportModes[shipment.transportMode] = 0;
        }
        transportModes[shipment.transportMode]++;
      });

      // Convert to percentages
      Object.keys(transportModes).forEach((mode) => {
        transportModes[mode] = (transportModes[mode] / shipments.length) * 100;
      });

      // Incidents count
      const incidents = await prisma.logisticsIncident.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lte: today,
          },
        },
        select: {
          type: true,
        },
      });

      const incidentTypes = {};

      incidents.forEach((incident) => {
        if (!incidentTypes[incident.type]) {
          incidentTypes[incident.type] = 0;
        }
        incidentTypes[incident.type]++;
      });

      // Regional distribution
      const regionalDistribution = {};

      shipments.forEach((shipment) => {
        if (shipment.region) {
          if (!regionalDistribution[shipment.region]) {
            regionalDistribution[shipment.region] = {
              count: 0,
              distance: 0,
            };
          }

          regionalDistribution[shipment.region].count++;
          regionalDistribution[shipment.region].distance +=
            shipment.distance || 0;
        }
      });

      data = {
        ...data,
        logistics: {
          totalShipments: shipments.length,
          transportModes,
          incidentCount: incidents.length,
          incidentTypes,
          regionalDistribution,
        },
      };
    }
    console.log(data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}

// Helper function to get monthly trends
async function getMonthlyTrends(fromDate: Date, toDate: Date) {
  const months = [];
  const currentDate = new Date(fromDate);

  while (currentDate <= toDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const orders = await prisma.commande.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    months.push({
      month: startOfMonth.toLocaleString("default", { month: "short" }),
      year: year,
      count: orders,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

// Helper function to get monthly revenue
async function getMonthlyRevenue(fromDate: Date, toDate: Date) {
  const months = [];
  const currentDate = new Date(fromDate);

  while (currentDate <= toDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const invoices = await prisma.facture.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        montant: true,
      },
    });

    const revenue = invoices.reduce((sum, invoice) => sum + invoice.montant, 0);

    months.push({
      month: startOfMonth.toLocaleString("default", { month: "short" }),
      year: year,
      revenue: revenue,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

// Helper function to get delivery time distribution
function getDeliveryTimeDistribution(deliveredOrders) {
  const distribution = {
    "1j": 0,
    "2j": 0,
    "3j": 0,
    "4j+": 0,
  };

  deliveredOrders.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    const deliveredAt = new Date(order.deliveredAt || "");
    const days = Math.ceil(
      (deliveredAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (days <= 1) {
      distribution["1j"]++;
    } else if (days <= 2) {
      distribution["2j"]++;
    } else if (days <= 3) {
      distribution["3j"]++;
    } else {
      distribution["4j+"]++;
    }
  });

  // Convert to percentages
  const total = deliveredOrders.length;
  if (total > 0) {
    Object.keys(distribution).forEach((key) => {
      distribution[key] = (distribution[key] / total) * 100;
    });
  }

  return distribution;
}
