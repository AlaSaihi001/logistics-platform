import { NextResponse } from "next/server"

type ApiResponseOptions = {
  status?: number
  headers?: Record<string, string>
  code?: string
}

export class ApiResponse {
  /**
   * Envoie une réponse de succès
   */
  static success<T>(data: T, options: ApiResponseOptions = {}) {
    const { status = 200, headers = {} } = options

    return NextResponse.json(data, {
      status,
      headers,
    })
  }

  /**
   * Envoie une réponse d'erreur générique
   */
  static error(message: string, options: ApiResponseOptions = {}) {
    const { status = 400, headers = {}, code } = options

    return NextResponse.json(
      {
        error: message,
        ...(code && { code }),
      },
      {
        status,
        headers,
      }
    )
  }

  /**
   * Erreur : ressource non trouvée
   */
  static notFound(message = "Ressource introuvable") {
    return this.error(message, { status: 404, code: "NOT_FOUND" })
  }

  /**
   * Erreur : accès non autorisé
   */
  static unauthorized(message = "Accès non autorisé") {
    return this.error(message, { status: 401, code: "UNAUTHORIZED" })
  }

  /**
   * Erreur : accès interdit
   */
  static forbidden(message = "Accès interdit") {
    return this.error(message, { status: 403, code: "FORBIDDEN" })
  }

  /**
   * Erreur de validation
   */
  static validationError(errors: Record<string, string>) {
    return NextResponse.json(
      {
        error: "Erreur de validation",
        code: "VALIDATION_ERROR",
        errors,
      },
      {
        status: 422,
      }
    )
  }

  /**
   * Erreur serveur
   */
  static serverError(message = "Erreur interne du serveur") {
    return this.error(message, { status: 500, code: "SERVER_ERROR" })
  }
}
