import React, { useState } from \ react\;
import { useNavigate, useLocation } from \react-router-dom\;
import { Container, Alert } from \@mui/material\;
import { PageHeader } from \../../components/ui\;
import CharacterForm from \./CharacterForm\;
import CharacterService, { CharacterInput } from \../../services/api/character.service\;

const CharacterCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get preselected IDs from location state if available
  const preselectedWorldId = location.state?.worldId;
  const preselectedCampaignId = location.state?.campaignId;
  const preselectedLocationId = location.state?.locationId;
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission
  const handleSubmit = async (data: CharacterInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create Character
      const createdCharacter = await CharacterService.createCharacter(data);
      
      // Navigate to the new character's detail page
      navigate(/characters/);
    } catch (error) {
      console.error(\Error creating Character:\, error);
      setError(\Failed to create Character. Please try again.\);
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    // If we came from a specific page, go back there
    if (preselectedWorldId) {
      navigate(/rpg-worlds/);
    } else if (preselectedCampaignId) {
      navigate(/campaigns/);
    } else if (preselectedLocationId) {
      navigate(/locations/);
    } else {
      navigate(\/characters\);
    }
  };
  
  return (
    <Container maxWidth=\lg\>
      <PageHeader
        title=\Create Character\
        subtitle=\Add a new character to your RPG world\
        breadcrumbs={[
          { label: \Dashboard\, href: \/dashboard\ },
          { label: \Characters\, href: \/characters\ },
          { label: \Create\ },
        ]}
      />
      
      {error && (
        <Alert severity=\error\ sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <CharacterForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        preselectedWorldId={preselectedWorldId}
        preselectedCampaignId={preselectedCampaignId}
        preselectedLocationId={preselectedLocationId}
      />
    </Container>
  );
};

export default CharacterCreatePage;
