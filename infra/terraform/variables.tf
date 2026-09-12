variable "subscription_id" {
  description = "Azure subscription ID (must be the approved target subscription)"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "koreacentral"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
}

variable "service_plan_name" {
  description = "App Service plan name"
  type        = string
}

variable "web_app_name" {
  description = "Linux Web App name (globally unique)"
  type        = string
}

variable "supabase_url" {
  description = "Supabase URL used by the Next.js app"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase anon key used by the Next.js app"
  type        = string
  sensitive   = true
}

variable "site_url" {
  description = "Public site URL for the app itself"
  type        = string
}
