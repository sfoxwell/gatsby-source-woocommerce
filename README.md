# Note
**Please note: the original author of this package is [Marc Glasser](https://github.com/marcaaron/) -- see the [the original repo](https://github.com/marcaaron/gatsby-source-woocommerce) and [package](https://www.npmjs.com/package/gatsby-source-woocommerce). This is a modified version for my use to avoid having to manually overwrite the files every time I change my packages in development.**

# gatsby-source-woocommerce
Source plugin for [Gatsby](https://www.gatsbyjs.org/). Pulls in data from protected routes via the [WooCommerce REST API](http://woocommerce.github.io/woocommerce-rest-api-docs/) with credentials.

## Install

`npm install --save @pasdo501/gatsby-source-woocommerce`

## How to Use

```javascript
// In gatsby-config.js
plugins:[
  {       
    resolve: "gatsby-source-woocommerce",
    options: {
	   // Base URL of Wordpress site
      api: 'wordpress.domain',
      // true if using https. false if nah.
      https: false,
      api_keys: {
        consumer_key: <key>,
        consumer_secret: <secret>,
      },
      // Array of strings with fields you'd like to create nodes for...
      fields: ['products'],
      // Version of the woocommerce API to use
      // OPTIONAL: defaults to 'wc/v1'
      api_version: ['wc/v3'],
      // OPTIONAL: How many results to retrieve
      per_page: 100
    }
  }
]
```

## Currently Supported Fields

- Products
- Customers
- Orders
- Reports
- Coupons

**Note**: If following the endpoint layout from the [WooCommerce REST API docs](https://woocommerce.github.io/woocommerce-rest-api-docs/?php#introduction), all fields that do not contain a wildcard *should* be supported.

For example, to get product categories: including 'products/categories' in fields will show up as allWcProductsCategories / wcProductsCategories
