# Modifying the landing page

We can adapt the landing page for signature commons by modifying two json files in the ui-schemas [landing-ui.json](../../ui-schemas/dashboard/landing_ui.json) and [ui.json](../../ui-schemas/dashboard/ui.json).

![alt text](../../static/sigcom-landing.png)

## Setting fields to count
We can tell the UI which keys to count by modifying the [landing-ui.json](../../ui-schemas/dashboard/landing_ui.json) file. The following table describe the fields for each entry

| Field         | Value           | Remarks |
| ------------- |---------------| ----------|
| Field_Name     | string          | Name of the meta field in the database|
| Type           | string          | type of the field in the database (string, object)|
| Table | string | Name of the field's table |
| Preferred_Name | string          |Display name of the field|
| MDI_Icon | string | Display icon (see [mdi-icon](https://materialdesignicons.com/) for more information) |
| Meta_Count | boolean | Tells the UI to display the field as part of the meta counts |
| Pie_Count | boolean | Tells the UI to display the field as part of the pie charts |
| Bar_Count | boolean | Tells the UI to display the field as part of the bar charts |
| Table_Count | boolean | Tells the UI to display this as part of the table counts |
| Visible_On_Landing | boolean | If Table_Count is true and this is true, the UI will display the stat on the landing page|
| Visible_On_Admin | boolean | If Table_Count is true and this is true, the UI will display the stat on the Admin page|

## Changing text content in the page

We can change text contenct in the landing page by modifying the [ui.json](../../ui-schemas/dashboard/ui.json) file. Note the following fields:

| Field         | Value           | Remarks |
| ------------- |---------------| ----------|
| landing | boolean | Use this ui for the landing page|
| admin | boolean | Use this ui for the admin page|
| content | object | You place your modifications here (see below) |

### Content field
Refer to the image above for more information.

| Field         | Value           | Remarks |
| ------------- |---------------| ----------|
| metadata_placeholder | string | Placeholder for the metadata search box |
| geneset_placeholder | string | Placeholder for the geneset search box |
| up_genes_placeholder | string | Placeholder for the up genes search box |
| down_genes_placeholder | string | Placeholder for the down genes search box |
| text_1 | string | Text for text_1 |
| text_2 | string | Text for text_2 |
| text_3 | string | Text for text_3 |
| text_4 | string | Text for text_4 |
| resource_pie_caption | string | Caption for resource pie chart |
| bar-chart | object | Controls the barcharts |

The bar-chart an object with the following fields

| Field         | Value           | Remarks |
| ------------- |---------------| ----------|
| Field_Name | string | Name of the field to create a bar chart (recall that we have a Bar_Count field in the landing-ui.json, we choose which field to construct a bar graph with this field)|
| Caption | string | Caption of the bargraph |
