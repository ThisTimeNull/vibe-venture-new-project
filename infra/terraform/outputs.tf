output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "web_app_name" {
  value = azurerm_linux_web_app.main.name
}

output "default_hostname" {
  value = azurerm_linux_web_app.main.default_hostname
}
