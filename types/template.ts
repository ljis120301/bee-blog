/**
 * Template type definition
 * ========================
 * Shared type for editor templates
 */

export interface Template {
    id: string;
    name: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}
