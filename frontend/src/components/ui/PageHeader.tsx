import React, { ReactNode } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.02)',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label= breadcrumb sx={{ mb: 2 }}>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast || !item.href ? (
              <Typography 
                key={item.label} 
                color=text.primary
                sx={{ 
                  fontWeight: isLast ? 500 : 400,
                  fontSize: '0.875rem',
                }}
              >
                {item.label}
              </Typography>
            ) : (
              <Link
                key={item.label}
                component={RouterLink}
                to={item.href}
                color=inherit
                sx={{ 
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'none',
                    color: 'primary.main',
                  },
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <Typography variant=h4 component=h1 gutterBottom={!!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant=subtitle1 color=text.secondary>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Box sx={{ ml: 'auto' }}>
            {action}
          </Box>
        )}
      </Box>
      
      <Divider sx={{ mt: 2 }} />
    </Paper>
  );
};

export default PageHeader;
