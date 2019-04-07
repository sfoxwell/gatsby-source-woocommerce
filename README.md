# Note
**Please note: the original author of this package is [Marc Glasser](https://github.com/marcaaron/) -- see the [the original repo](https://github.com/marcaaron/gatsby-source-woocommerce) and [package](https://www.npmjs.com/package/gatsby-source-woocommerce).**

# gatsby-source-woocommerce
Source plugin for [Gatsby](https://www.gatsbyjs.org/). Pulls in data from protected routes via the [WooCommerce REST API](http://woocommerce.github.io/woocommerce-rest-api-docs/) with credentials.

## Contents
- [Install](#install)
- [How to Use](#how-to-use)
- [Currently Supported Fields](#currently-supported-fields)
- [GraphQL Query Examples](#some-graphql-query-examples)
- [Integration with gatsby-image](#integration-with-gatsby-image)


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
      api_version: 'wc/v3',
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
```graphql
{
  allWcProducts {
    edges {
      node {
        id
        wordpress_id
        name
        categories {
          wordpress_id
        }
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
```graphql
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
```graphql
{
  wcProducts(wordpress_id: {eq: 12}) {
    name
    price
    related_ids
  }
}
```
### Specific product category with (associated products):
```graphql
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

### All Product Tags and their associated products:
```graphql
{
  allWcProductsTags {
    nodes {
      name
      count
      products {
        name
      }
    }
  }
}
```

## Integration with `gatsby-image`

You can use images coming from this plugin with [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/). `gatsby-image` is a React component specially designed to work seamlessly with Gatsby’s GraphQL queries. It combines Gatsby’s native image processing capabilities with advanced image loading techniques to easily and completely optimize image loading for your sites.

To use this, you will first need to install and configure it and its dependencies.

```bash
npm install gatsby-image gatsby-transformer-sharp gatsby-plugin-sharp
```

Then add these plugins to `gatsby-config.js`:

```javascript
plugins: [`gatsby-transformer-sharp`, `gatsby-plugin-sharp`]
```

You can then use the `gatsby-image` component:

```javascript
import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <Img fluid={data.wcProducts.images[0].localFile.childImageSharp.fluid} alt={data.wcProducts.images[0].alt} />
  </div>
)

export const query = graphql`
  query allProducts {
     wcProducts (slug: {
        eq: "test-product"
      }) {
        id
        name
        images {
          alt
          localFile {
            childImageSharp {
              fluid {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
  }
`
```

Some example queries for the fixed and fluid types are below.

### Responsive Fluid

```graphql
{
  wcProducts (slug: {
    eq: "test-product"
  }) {
    id
    name
    images {
      alt
      localFile {
        childImageSharp {
          fluid (maxWidth: 800, cropFocus: CENTER) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
}
```

### Responsive Fixed

```graphql
{
  wcProducts (slug: {
    eq: "test-product"
  }) {
    id
    name
    images {
      alt
      localFile {
        childImageSharp {
          fixed (width: 800, toFormat: JPG) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  }
}
```

### Resize

```graphql
{
  wcProducts (slug: {
    eq: "test-product"
  }) {
    id
    name
    images {
      alt
      localFile {
        childImageSharp {
          resize (width: 800, height: 600, cropFocus: CENTER, quality: 80) {
            src
          }
        }
      }
    }
  }
}
```

You can visit [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/) for more information, and to learn about the different types of queries.

## Changelog
- 0.3.5: Gatsby Image related documentation c/o [Travis Reynolds](https://github.com/thetre97)
- 0.3.4: Mapping products & tags to each other
- 0.3.3: Fixing issues related to product - category mapping, API version. (Thank you [Travis Reynolds](https://github.com/thetre97)).
         Product categories IDs can now also be accessed with wordpress_id when no category nodes are pulled in. This is to keep access consistent,
         whether or not categories are used. Previously, without the 'products/categories' field, product category ID was accessed as product<span />.categories.id (an integer),
         while with the 'products/categories' field, it was product.categories.wordpress_id (since categories<span />.id is now the node ID - a string).
- 0.3.2: Mapping products & categories to each other
- 0.3.0: Associated products & product categories with local file images downloaded during the build process to allow use of image transform plugins.
