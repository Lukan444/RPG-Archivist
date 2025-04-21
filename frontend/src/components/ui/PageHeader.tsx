import React, { ReactNode } from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs sx={{ mb: 1 }}>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return isLast || !item.href ? (
                  <Typography key={index} color={isLast ? 'text.primary' : 'text.secondary'}>
                    {item.label}
                  </Typography>
                ) : (
                  <MuiLink
                    key={index}
                    component={Link}
                    to={item.href}
                    color="inherit"
                    underline="hover"
                  >
                    {item.label}
                  </MuiLink>
                );
              })}
            </Breadcrumbs>
          )}

          <Typography variant="h4" component="h1">
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ ml: 2 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PageHeader;
