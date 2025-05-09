export default {
  logo: <span>Contact Management System</span>,
  project: {
    link: 'https://github.com/your-repo',
  },
  docsRepositoryBase: 'https://github.com/your-repo/tree/main',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Contact Management System',
    };
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Contact Management System" />
      <meta property="og:description" content="Documentation for the Contact Management System" />
    </>
  ),
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://your-website.com" target="_blank">
          Your Company
        </a>
        .
      </span>
    ),
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    float: true,
    title: 'On This Page',
  },
  editLink: {
    text: 'Edit this page on GitHub',
  },
  feedback: {
    content: 'Questions? Give us feedback →',
    labels: 'feedback',
  },
  banner: {
    key: 'launch',
    text: '🎉 We just launched v1.0.0! Read the announcement →',
  },
  search: {
    placeholder: 'Search documentation...',
  },
  navigation: {
    prev: true,
    next: true,
  },
  gitTimestamp: ({ timestamp }) => (
    <span>Last updated on {timestamp.toLocaleDateString()}</span>
  ),
}; 