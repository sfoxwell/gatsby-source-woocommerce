# Note
**Please note: the original author of this package is [Marc Glasser](https://github.com/marcaaron/) -- see the [the original repo](https://github.com/marcaaron/gatsby-source-woocommerce) and [package](https://www.npmjs.com/package/gatsby-source-woocommerce).**

# gatsby-source-woocommerce
Source plugin for [Gatsby](https://www.gatsbyjs.org/). Pulls in data from protected routes via the [WooCommerce REST API](http://woocommerce.github.io/woocommerce-rest-api-docs/) with credentials.

## Install

`npm install --save @pasdo501/gatsby-source-woocommerce`

## How to Use

```javascript
// In gatsby-config.js
plugins:[
  {       
    resolve: '@pasdo501/gatsby-source-woocommerce',
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

Definitive: 
- Products
- Customers
- Orders
- Reports
- Coupons

**Note**: If following the endpoint layout from the [WooCommerce REST API docs](https://woocommerce.github.io/woocommerce-rest-api-docs/?php#introduction), all fields that do not contain a wildcard *should* be supported.

For example, to get product categories: including 'products/categories' in fields will show up as allWcProductsCategories / wcProductsCategories

## Some GraphQL Query Examples

### All products (with associated images):
```
{
  allWcProducts {
    edges {
      node {
        id
        wordpress_id
        name
        images {
          localFile {
            // childImageSharp ... etc
          }
        }
      }
    }
  }
}
```

### All product categories (with associated image):
```
{
  allWcProductsCategories {
    edges {
      node {
        id
        wordpress_id
        name
        slug
        image {
          localFile {
            // childImageSharp ... etc
          }
        }
      }
    }
  }
}
```

### Specific product by wordpress ID:
```
{
  wcProducts(wordpress_id: {eq: 12}) {
    name
    price
    related_ids
  }
}
```
### Specific product category with associated products
```
{
  wcProductsCategories(wordpress_id: {eq: 20}) {
     name
     slug
     products {
       name
       price
       images {
         localFile {
           // childImageSharp ... etc
         }
       }
     }
   }
}
```

## Changelog
- 0.3.2: Mapping products & categories to each other
- 0.3.0: Associated products & product categories with local file images downloaded during the build process to allow use of image transform plugins.