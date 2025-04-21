import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ContentAnalysisService,
  ContentSuggestion,
  SuggestionType,
  SuggestionStatus,
  ConfidenceLevel,
  CharacterSuggestion,
  LocationSuggestion,
  RelationshipSuggestion,
  LoreSuggestion,
  DialogSuggestion,
  EventSuggestion,
  NoteSuggestion
} from '../../services/api/content-analysis.service';
import { formatDistanceToNow } from 'date-fns';

interface SuggestionDetailProps {
  suggestionId: string;
  onStatusChange?: (status: SuggestionStatus) => void;
  onBack?: () => void;
}

const SuggestionDetail: React.FC<SuggestionDetailProps> = ({
  suggestionId,
  onStatusChange,
  onBack
}) => {
  const [suggestion, setSuggestion] = useState<ContentSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | 'delete' | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState<Partial<ContentSuggestion>>({});

  useEffect(() => {
    fetchSuggestion();
  }, [suggestionId]);

  const fetchSuggestion = async () => {
    try {
      setLoading(true);
      setError(null);

      const suggestion = await ContentAnalysisService.getSuggestion(suggestionId);
      setSuggestion(suggestion);

      // Initialize edited suggestion with current values
      setEditedSuggestion({
        title: suggestion.title,
        description: suggestion.description
      });
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      setError('Failed to load suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionStatusLabel = (status: SuggestionStatus): string => {
    switch (status) {
      case SuggestionStatus.PENDING:
        return 'Pending';
      case SuggestionStatus.ACCEPTED:
        return 'Accepted';
      case SuggestionStatus.REJECTED:
        return 'Rejected';
      case SuggestionStatus.MODIFIED:
        return 'Modified';
      default:
        return status;
    }
  };

  const getSuggestionStatusColor = (status: SuggestionStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case SuggestionStatus.PENDING:
        return 'warning';
      case SuggestionStatus.ACCEPTED:
        return 'success';
      case SuggestionStatus.REJECTED:
        return 'error';
      case SuggestionStatus.MODIFIED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getSuggestionTypeName = (type: SuggestionType): string => {
    switch (type) {
      case SuggestionType.CHARACTER:
        return 'Character';
      case SuggestionType.LOCATION:
        return 'Location';
      case SuggestionType.ITEM:
        return 'Item';
      case SuggestionType.EVENT:
        return 'Event';
      case SuggestionType.RELATIONSHIP:
        return 'Relationship';
      case SuggestionType.LORE:
        return 'Lore';
      case SuggestionType.DIALOG:
        return 'Dialog';
      case SuggestionType.PLOT:
        return 'Plot';
      case SuggestionType.NOTE:
        return 'Note';
      default:
        return type;
    }
  };

  const getConfidenceColor = (confidence: ConfidenceLevel): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (confidence) {
      case ConfidenceLevel.HIGH:
        return 'success';
      case ConfidenceLevel.MEDIUM:
        return 'primary';
      case ConfidenceLevel.LOW:
        return 'default';
      default:
        return 'default';
    }
  };

  const renderSuggestionDetails = () => {
    if (!suggestion) return null;

    switch (suggestion.type) {
      case SuggestionType.CHARACTER:
        return renderCharacterDetails(suggestion as CharacterSuggestion);
      case SuggestionType.LOCATION:
        return renderLocationDetails(suggestion as LocationSuggestion);
      case SuggestionType.RELATIONSHIP:
        return renderRelationshipDetails(suggestion as RelationshipSuggestion);
      case SuggestionType.LORE:
        return renderLoreDetails(suggestion as LoreSuggestion);
      case SuggestionType.DIALOG:
        return renderDialogDetails(suggestion as DialogSuggestion);
      case SuggestionType.EVENT:
        return renderEventDetails(suggestion as EventSuggestion);
      case SuggestionType.NOTE:
        return renderNoteDetails(suggestion as NoteSuggestion);
      default:
        return (
          <Typography variant="body1" color="text.secondary">
            No specific details available for this suggestion type.
          </Typography>
        );
    }
  };

  const renderCharacterDetails = (character: CharacterSuggestion) => {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Name
              </Typography>
              <Typography variant="body1" paragraph>
                {character.characterData.name}
              </Typography>

              {character.characterData.description && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {character.characterData.description}
                  </Typography>
                </>
              )}

              {character.characterData.appearance && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Appearance
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {character.characterData.appearance}
                  </Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {character.characterData.background && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Background
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {character.characterData.background}
                  </Typography>
                </>
              )}

              {character.characterData.personality && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Personality
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {character.characterData.personality}
                  </Typography>
                </>
              )}

              {character.characterData.goals && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Goals
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {character.characterData.goals}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>

          {character.characterData.relationships && character.characterData.relationships.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Relationships
              </Typography>
              <Grid container spacing={1}>
                {character.characterData.relationships.map((relationship, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {relationship.sourceName} →
                      </Typography>
                      <Chip label={relationship.relationshipType} size="small" />
                      <Typography variant="body2">
                        → {relationship.targetName}
                      </Typography>
                    </Box>
                    {relationship.description && (
                      <Typography variant="body2" color="text.secondary">
                        {relationship.description}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLocationDetails = (location: LocationSuggestion) => {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Name
              </Typography>
              <Typography variant="body1" paragraph>
                {location.locationData.name}
              </Typography>

              {location.locationData.description && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {location.locationData.description}
                  </Typography>
                </>
              )}

              {location.locationData.features && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Features
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {location.locationData.features}
                  </Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {location.locationData.history && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    History
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {location.locationData.history}
                  </Typography>
                </>
              )}

              {location.locationData.inhabitants && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Inhabitants
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {location.locationData.inhabitants}
                  </Typography>
                </>
              )}

              {location.locationData.parentLocationId && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Parent Location
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {location.locationData.parentLocationId}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>

          {location.locationData.pointsOfInterest && location.locationData.pointsOfInterest.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Points of Interest
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {location.locationData.pointsOfInterest.map((poi, index) => (
                  <Chip key={index} label={poi} />
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderRelationshipDetails = (relationship: RelationshipSuggestion) => {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Typography variant="h6">
              {relationship.relationshipData.sourceName}
            </Typography>
            <Box sx={{ mx: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Chip
                label={relationship.relationshipData.relationshipType}
                color="primary"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {relationship.relationshipData.strength ? `Strength: ${relationship.relationshipData.strength}/10` : ''}
              </Typography>
            </Box>
            <Typography variant="h6">
              {relationship.relationshipData.targetName}
            </Typography>
          </Box>

          {relationship.relationshipData.description && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {relationship.relationshipData.description}
              </Typography>
            </>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Source
              </Typography>
              <Typography variant="body1">
                Name: {relationship.relationshipData.sourceName}
              </Typography>
              {relationship.relationshipData.sourceId && (
                <Typography variant="body2" color="text.secondary">
                  ID: {relationship.relationshipData.sourceId}
                </Typography>
              )}
              {relationship.relationshipData.sourceType && (
                <Typography variant="body2" color="text.secondary">
                  Type: {relationship.relationshipData.sourceType}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Target
              </Typography>
              <Typography variant="body1">
                Name: {relationship.relationshipData.targetName}
              </Typography>
              {relationship.relationshipData.targetId && (
                <Typography variant="body2" color="text.secondary">
                  ID: {relationship.relationshipData.targetId}
                </Typography>
              )}
              {relationship.relationshipData.targetType && (
                <Typography variant="body2" color="text.secondary">
                  Type: {relationship.relationshipData.targetType}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderLoreDetails = (lore: LoreSuggestion) => {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Title
          </Typography>
          <Typography variant="body1" paragraph>
            {lore.loreData.title}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Content
          </Typography>
          <Typography variant="body1" paragraph>
            {lore.loreData.content}
          </Typography>

          {lore.loreData.category && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Category
              </Typography>
              <Typography variant="body1" paragraph>
                {lore.loreData.category}
              </Typography>
            </>
          )}

          {lore.loreData.tags && lore.loreData.tags.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {lore.loreData.tags.map((tag, index) => (
                  <Chip key={index} label={tag} />
                ))}
              </Box>
            </>
          )}

          {lore.loreData.relatedEntities && lore.loreData.relatedEntities.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Related Entities
              </Typography>
              <Grid container spacing={1}>
                {lore.loreData.relatedEntities.map((entity, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={entity.name}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDialogDetails = (dialog: DialogSuggestion) => {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Character
          </Typography>
          <Typography variant="body1" paragraph>
            {dialog.dialogData.characterName}
            {dialog.dialogData.characterId && ` (ID: ${dialog.dialogData.characterId})`}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Dialog Content
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            "{dialog.dialogData.content}"
          </Typography>

          {dialog.dialogData.context && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Context
              </Typography>
              <Typography variant="body1" paragraph>
                {dialog.dialogData.context}
              </Typography>
            </>
          )}

          {dialog.dialogData.tone && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Tone
              </Typography>
              <Chip label={dialog.dialogData.tone} />
            </>
          )}

          {dialog.dialogData.purpose && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Purpose
              </Typography>
              <Chip label={dialog.dialogData.purpose} />
            </>
          )}

          {dialog.dialogData.alternatives && dialog.dialogData.alternatives.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Alternative Phrasings
              </Typography>
              {dialog.dialogData.alternatives.map((alt, index) => (
                <Typography key={index} variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                  "{alt}"
                </Typography>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEventDetails = (event: EventSuggestion) => {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Name
              </Typography>
              <Typography variant="body1" paragraph>
                {event.eventData.name}
              </Typography>

              {event.eventData.description && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {event.eventData.description}
                  </Typography>
                </>
              )}

              {event.eventData.date && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Date
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {event.eventData.date}
                  </Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {event.eventData.location && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {event.eventData.location}
                  </Typography>
                </>
              )}

              {event.eventData.importance && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Importance
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {event.eventData.importance}/10
                  </Typography>
                </>
              )}

              {event.eventData.consequences && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Consequences
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {event.eventData.consequences}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>

          {event.eventData.participants && event.eventData.participants.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Participants
              </Typography>
              <Grid container spacing={1}>
                {event.eventData.participants.map((participant, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={`${participant.name}${participant.role ? ` (${participant.role})` : ''}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleConfirmAction = (action: 'accept' | 'reject' | 'delete') => {
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  const handleActionConfirmed = async () => {
    if (!confirmAction) return;

    try {
      setLoading(true);

      switch (confirmAction) {
        case 'accept':
          await ContentAnalysisService.acceptSuggestion(suggestionId);
          if (onStatusChange) {
            onStatusChange(SuggestionStatus.ACCEPTED);
          }
          break;
        case 'reject':
          await ContentAnalysisService.rejectSuggestion(suggestionId);
          if (onStatusChange) {
            onStatusChange(SuggestionStatus.REJECTED);
          }
          break;
        case 'delete':
          await ContentAnalysisService.deleteSuggestion(suggestionId);
          if (onBack) {
            onBack();
          }
          return; // Don't fetch suggestion after deletion
      }

      // Refresh suggestion data
      await fetchSuggestion();
    } catch (error) {
      console.error(`Error ${confirmAction}ing suggestion:`, error);
      setError(`Failed to ${confirmAction} suggestion. Please try again.`);
    } finally {
      setLoading(false);
      handleConfirmDialogClose();
    }
  };

  const handleSaveModifications = async () => {
    if (!suggestion) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare modified suggestion data
      const modifiedData: Partial<ContentSuggestion> = {
        title: editedSuggestion.title,
        description: editedSuggestion.description
      };

      // Add type-specific data
      switch (suggestion.type) {
        case SuggestionType.CHARACTER:
          if (editedSuggestion.characterData) {
            modifiedData.characterData = editedSuggestion.characterData;
          }
          break;
        case SuggestionType.LOCATION:
          if (editedSuggestion.locationData) {
            modifiedData.locationData = editedSuggestion.locationData;
          }
          break;
        case SuggestionType.RELATIONSHIP:
          if (editedSuggestion.relationshipData) {
            modifiedData.relationshipData = editedSuggestion.relationshipData;
          }
          break;
        case SuggestionType.LORE:
          if (editedSuggestion.loreData) {
            modifiedData.loreData = editedSuggestion.loreData;
          }
          break;
        case SuggestionType.DIALOG:
          if (editedSuggestion.dialogData) {
            modifiedData.dialogData = editedSuggestion.dialogData;
          }
          break;
        case SuggestionType.EVENT:
          if (editedSuggestion.eventData) {
            modifiedData.eventData = editedSuggestion.eventData;
          }
          break;
        case SuggestionType.NOTE:
          if (editedSuggestion.noteData) {
            modifiedData.noteData = editedSuggestion.noteData;
          }
          break;
      }

      // Call API to modify suggestion
      await ContentAnalysisService.modifySuggestion(suggestionId, modifiedData);

      // Update status if callback provided
      if (onStatusChange) {
        onStatusChange(SuggestionStatus.MODIFIED);
      }

      // Refresh suggestion data
      await fetchSuggestion();

      // Exit edit mode
      setEditMode(false);
    } catch (error) {
      console.error('Error modifying suggestion:', error);
      setError('Failed to modify suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEditFields = () => {
    if (!suggestion) return null;

    switch (suggestion.type) {
      case SuggestionType.CHARACTER:
        return renderCharacterEditFields(suggestion as CharacterSuggestion);
      case SuggestionType.LOCATION:
        return renderLocationEditFields(suggestion as LocationSuggestion);
      case SuggestionType.RELATIONSHIP:
        return renderRelationshipEditFields(suggestion as RelationshipSuggestion);
      case SuggestionType.LORE:
        return renderLoreEditFields(suggestion as LoreSuggestion);
      case SuggestionType.DIALOG:
        return renderDialogEditFields(suggestion as DialogSuggestion);
      case SuggestionType.EVENT:
        return renderEventEditFields(suggestion as EventSuggestion);
      case SuggestionType.NOTE:
        return renderNoteEditFields(suggestion as NoteSuggestion);
      default:
        return null;
    }
  };

  const renderCharacterEditFields = (character: CharacterSuggestion) => {
    // Initialize character data in edited suggestion if not already present
    if (!editedSuggestion.characterData) {
      setEditedSuggestion(prev => ({
        ...prev,
        characterData: { ...character.characterData }
      }));
      return null; // Return null on first render to avoid errors
    }

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Character Name"
            value={editedSuggestion.characterData?.name || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              characterData: { ...prev.characterData, name: e.target.value }
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Appearance"
            value={editedSuggestion.characterData?.appearance || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              characterData: { ...prev.characterData, appearance: e.target.value }
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Background"
            value={editedSuggestion.characterData?.background || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              characterData: { ...prev.characterData, background: e.target.value }
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Personality"
            value={editedSuggestion.characterData?.personality || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              characterData: { ...prev.characterData, personality: e.target.value }
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Goals"
            value={editedSuggestion.characterData?.goals || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              characterData: { ...prev.characterData, goals: e.target.value }
            }))}
          />
        </Grid>
      </Grid>
    );
  };

  // For brevity, we'll implement just one more edit field renderer
  // In a real implementation, you would implement all the edit field renderers
  const renderLocationEditFields = (location: LocationSuggestion) => {
    // Initialize location data in edited suggestion if not already present
    if (!editedSuggestion.locationData) {
      setEditedSuggestion(prev => ({
        ...prev,
        locationData: { ...location.locationData }
      }));
      return null; // Return null on first render to avoid errors
    }

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location Name"
            value={editedSuggestion.locationData?.name || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              locationData: { ...prev.locationData, name: e.target.value }
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Features"
            value={editedSuggestion.locationData?.features || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              locationData: { ...prev.locationData, features: e.target.value }
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="History"
            value={editedSuggestion.locationData?.history || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              locationData: { ...prev.locationData, history: e.target.value }
            }))}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Inhabitants"
            value={editedSuggestion.locationData?.inhabitants || ''}
            onChange={(e) => setEditedSuggestion(prev => ({
              ...prev,
              locationData: { ...prev.locationData, inhabitants: e.target.value }
            }))}
          />
        </Grid>
      </Grid>
    );
  };

  // Placeholder functions for other edit field renderers
  const renderRelationshipEditFields = (relationship: RelationshipSuggestion) => {
    // Similar implementation as above
    return <Typography>Relationship edit fields would go here</Typography>;
  };

  const renderLoreEditFields = (lore: LoreSuggestion) => {
    // Similar implementation as above
    return <Typography>Lore edit fields would go here</Typography>;
  };

  const renderDialogEditFields = (dialog: DialogSuggestion) => {
    // Similar implementation as above
    return <Typography>Dialog edit fields would go here</Typography>;
  };

  const renderEventEditFields = (event: EventSuggestion) => {
    // Similar implementation as above
    return <Typography>Event edit fields would go here</Typography>;
  };

  const renderNoteEditFields = (note: NoteSuggestion) => {
    // Similar implementation as above
    return <Typography>Note edit fields would go here</Typography>;
  };

  const renderNoteDetails = (note: NoteSuggestion) => {
    return (

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Title
          </Typography>
          <Typography variant="body1" paragraph>
            {note.noteData.title}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Content
          </Typography>
          <Typography variant="body1" paragraph>
            {note.noteData.content}
          </Typography>

          {note.noteData.category && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Category
              </Typography>
              <Typography variant="body1" paragraph>
                {note.noteData.category}
              </Typography>
            </>
          )}

          {note.noteData.tags && note.noteData.tags.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {note.noteData.tags.map((tag, index) => (
                  <Chip key={index} label={tag} />
                ))}
              </Box>
            </>
          )}

          {note.noteData.relatedEntities && note.noteData.relatedEntities.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Related Entities
              </Typography>
              <Grid container spacing={1}>
                {note.noteData.relatedEntities.map((entity, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={entity.name}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Suggestion Detail</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : suggestion ? (
        <Box>
          {editMode ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Edit Suggestion
              </Typography>

              <TextField
                fullWidth
                label="Title"
                value={editedSuggestion.title || ''}
                onChange={(e) => setEditedSuggestion({ ...editedSuggestion, title: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={editedSuggestion.description || ''}
                onChange={(e) => setEditedSuggestion({ ...editedSuggestion, description: e.target.value })}
                sx={{ mb: 2 }}
              />

              {renderEditFields()}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveModifications}
                  disabled={!editedSuggestion.title || !editedSuggestion.description}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {suggestion.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  label={getSuggestionStatusLabel(suggestion.status)}
                  color={getSuggestionStatusColor(suggestion.status)}
                />

                <Chip
                  label={getSuggestionTypeName(suggestion.type)}
                  variant="outlined"
                />

                <Chip
                  label={suggestion.confidence}
                  color={getConfidenceColor(suggestion.confidence)}
                  variant="outlined"
                />

                {suggestion.sourceDetails && (
                  <Chip
                    label={`Source: ${suggestion.sourceDetails.name}`}
                    variant="outlined"
                  />
                )}

                {suggestion.contextDetails && (
                  <Chip
                    label={`Context: ${suggestion.contextDetails.name}`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <Box>
              <Button
                variant="outlined"
                onClick={onBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {suggestion.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Suggestion Details
          </Typography>

          {renderSuggestionDetails()}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            {suggestion.status === SuggestionStatus.PENDING && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleConfirmAction('reject')}
                >
                  Reject
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setEditMode(true)}
                >
                  Modify
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleConfirmAction('accept')}
                >
                  Accept
                </Button>
              </>
            )}

            <Button
              variant="outlined"
              color="error"
              onClick={() => handleConfirmAction('delete')}
            >
              Delete
            </Button>
          </Box>
          )}
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Suggestion not found
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmAction === 'accept' && 'Accept Suggestion'}
          {confirmAction === 'reject' && 'Reject Suggestion'}
          {confirmAction === 'delete' && 'Delete Suggestion'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction === 'accept' && 'Are you sure you want to accept this suggestion?'}
            {confirmAction === 'reject' && 'Are you sure you want to reject this suggestion?'}
            {confirmAction === 'delete' && 'Are you sure you want to delete this suggestion? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Cancel</Button>
          <Button
            onClick={handleActionConfirmed}
            color={
              confirmAction === 'accept' ? 'success' :
              confirmAction === 'reject' ? 'error' :
              'error'
            }
            autoFocus
          >
            {confirmAction === 'accept' && 'Accept'}
            {confirmAction === 'reject' && 'Reject'}
            {confirmAction === 'delete' && 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SuggestionDetail;
