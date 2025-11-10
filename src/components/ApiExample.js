import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert,
  Button,
  Box
} from '@mui/material';
import { useCities, useCategories, useServices, useEvents, useApiMutation } from '../hooks/useApi';
import { cityApi, categoryApi, serviceApi, eventsApi } from '../services/api';

const ApiExample = () => {
  // Using the custom hooks for fetching data
  const { data: cities, loading: citiesLoading, error: citiesError, refetch: refetchCities } = useCities();
  const { data: categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();
  const { data: services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
  const { data: events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents();
  
  // Using the mutation hook for create/update/delete operations
  const { loading: mutationLoading, error: mutationError, executeMutation } = useApiMutation();

  const handleCreateCity = async () => {
    try {
      const newCity = {
        name: 'New City',
        description: 'A new city example'
      };
      await executeMutation(() => cityApi.create(newCity));
      refetchCities(); // Refresh the cities list
    } catch (error) {
      console.error('Failed to create city:', error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const newCategory = {
        name: 'New Category',
        description: 'A new category example'
      };
      await executeMutation(() => categoryApi.create(newCategory));
      refetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleCreateService = async () => {
    try {
      const newService = {
        name: 'New Service',
        description: 'A new service example'
      };
      await executeMutation(() => serviceApi.create(newService));
      refetchServices(); // Refresh the services list
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const newEvent = {
        name: 'New Event',
        description: 'A new event example'
      };
      await executeMutation(() => eventsApi.create(newEvent));
      refetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        API Endpoints Example
      </Typography>
      
      {/* Cities Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cities API
          </Typography>
          {citiesLoading ? (
            <CircularProgress size={20} />
          ) : citiesError ? (
            <Alert severity="error">{citiesError}</Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleCreateCity}
                  disabled={mutationLoading}
                  sx={{ mb: 2 }}
                >
                  Create New City
                </Button>
              </Grid>
                             {cities && cities.map((city, index) => (
                 <Grid item xs={12} sm={6} md={4} key={city.id || index}>
                   <Card variant="outlined">
                     <CardContent>
                       <Typography variant="h6">{city.name}</Typography>
                       <Typography variant="body2" color="text.secondary">
                         ID: {city.id} | Active: {city.is_active ? 'Yes' : 'No'}
                       </Typography>
                     </CardContent>
                   </Card>
                 </Grid>
               ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Categories API
          </Typography>
          {categoriesLoading ? (
            <CircularProgress size={20} />
          ) : categoriesError ? (
            <Alert severity="error">{categoriesError}</Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleCreateCategory}
                  disabled={mutationLoading}
                  sx={{ mb: 2 }}
                >
                  Create New Category
                </Button>
              </Grid>
                             {categories && categories.map((category, index) => (
                 <Grid item xs={12} sm={6} md={4} key={category.id || index}>
                   <Card variant="outlined">
                     <CardContent>
                       <Typography variant="h6">{category.name}</Typography>
                       <Typography variant="body2" color="text.secondary">
                         ID: {category.id} | Services: {category.services_count} | Order: {category.order}
                       </Typography>
                       {category.description && (
                         <Typography variant="body2" color="text.secondary">
                           {category.description}
                         </Typography>
                       )}
                     </CardContent>
                   </Card>
                 </Grid>
               ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Services API
          </Typography>
          {servicesLoading ? (
            <CircularProgress size={20} />
          ) : servicesError ? (
            <Alert severity="error">{servicesError}</Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleCreateService}
                  disabled={mutationLoading}
                  sx={{ mb: 2 }}
                >
                  Create New Service
                </Button>
              </Grid>
              {services && services.map((service, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{service.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
                 </CardContent>
       </Card>

       {/* Events Section */}
       <Card sx={{ mb: 3 }}>
         <CardContent>
           <Typography variant="h6" gutterBottom>
             Events API
           </Typography>
           {eventsLoading ? (
             <CircularProgress size={20} />
           ) : eventsError ? (
             <Alert severity="error">{eventsError}</Alert>
           ) : (
             <Grid container spacing={2}>
               <Grid item xs={12}>
                 <Button 
                   variant="contained" 
                   onClick={handleCreateEvent}
                   disabled={mutationLoading}
                   sx={{ mb: 2 }}
                 >
                   Create New Event
                 </Button>
               </Grid>
               {events && events.map((event, index) => (
                 <Grid item xs={12} sm={6} md={4} key={event.id || index}>
                   <Card variant="outlined">
                     <CardContent>
                       <Typography variant="h6">{event.name}</Typography>
                       <Typography variant="body2" color="text.secondary">
                         {event.description}
                       </Typography>
                     </CardContent>
                   </Card>
                 </Grid>
               ))}
             </Grid>
           )}
         </CardContent>
       </Card>

       {/* Error Display */}
       {mutationError && (
         <Alert severity="error" sx={{ mb: 2 }}>
           {mutationError}
         </Alert>
       )}
     </Box>
   );
 };

export default ApiExample; 