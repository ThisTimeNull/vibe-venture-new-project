resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_service_plan" "main" {
  name                = var.service_plan_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "main" {
  name                = var.web_app_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  site_config {
    always_on        = false
    app_command_line = "node server.js"

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    SCM_DO_BUILD_DURING_DEPLOYMENT = "false"
    WEBSITES_PORT                 = "8080"
    PORT                          = "8080"
    NODE_ENV                      = "production"
    BLOG_MOCK_MODE                = "off"
    NEXT_TELEMETRY_DISABLED       = "1"
    NEXT_PUBLIC_SUPABASE_URL      = var.supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY = var.supabase_anon_key
    NEXT_PUBLIC_SITE_URL          = var.site_url
  }
}
