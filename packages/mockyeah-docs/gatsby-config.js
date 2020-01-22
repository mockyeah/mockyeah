const gatsbyRemarkPlugins = [
  `gatsby-remark-autolink-headers`,
  `gatsby-remark-prismjs`,
  `gatsby-remark-images`,
  `gatsby-remark-copy-linked-files`
];

module.exports = {
  siteMetadata: {
    title: `mockyeah`,
    description: `A powerful service mocking, recording, and playback utility.`,
    author: `@mockyeah`
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages`
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `mockyeah`,
        short_name: `mockyeah`,
        start_url: `/`,
        background_color: `#9014fe`,
        theme_color: `#9014fe`,
        display: `minimal-ui`,
        icon: `src/images/logo/mockyeah.png` // This path is relative to the root of the site.
      }
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        // CommonMark mode (default: true)
        commonmark: true,
        // Footnotes mode (default: true)
        footnotes: true,
        // Pedantic mode (default: true)
        pedantic: true,
        // GitHub Flavored Markdown mode (default: true)
        gfm: true,
        // Plugins configs
        plugins: gatsbyRemarkPlugins
      }
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        defaultLayouts: {
          default: require.resolve('./src/layouts/default.js')
        },
        gatsbyRemarkPlugins
      }
    },
    {
      resolve: 'gatsby-plugin-markdown-pages',
      options: {
        path: './src/pages', // Path to markdown files to be converted to pages
        templatePath: './src/layouts', // Path to page templates
        template: 'markdown' // Default template to use if none is supplied
      }
    },
    'gatsby-plugin-catch-links'
    // {
    //   resolve: '@stackbit/gatsby-plugin-menus',
    //   options: {
    //     // static definition of menu items (optional)
    //     menus: {
    //       // identifier of menu container
    //       main: [
    //         // array of contained children menu items
    //         {
    //           identifier: 'myId', // identifier for this item (optional)
    //           title: 'Title for page',
    //           url: '/page-1/',
    //           weight: 1
    //         }
    //       ]
    //     },
    //     // Gatsby node types from which we extract menus (optional, see "Advanced usage")
    //     // sourceNodeType: 'MarkdownRemark',
    //     sourceNodeType: 'SitePage',
    //     // the relative node path where we can find the 'menus' container (optional)
    //     sourceDataPath: 'frontmatter',
    //     // the relative node path where we can find the page's URL (required)
    //     sourceUrlPath: 'fields.url',
    //     // custom menu loading function (optional)
    //     // menuLoader: customLoaderFunction,
    //     // the property to use for injecting to the page context (optional, see "Advanced usage")
    //     pageContextProperty: 'menus'
    //   }
    // }
  ]
};
