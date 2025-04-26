import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  TextField,
  Alert,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import {
  ChangeProposalService,
  ChangeProposal,
  ProposalStatus,
  ProposalType,
  ProposalEntityType,
  ChangeField,
  RelationshipChange
} from '../../services/api/change-proposal.service';
import { formatDistanceToNow } from 'date-fns';

interface ProposalReviewProps {
  proposalId: string;
  onStatusChange?: (status: ProposalStatus) => void;
  onApplied?: () => void;
}

const ProposalReview: React.FC<ProposalReviewProps> = ({
  proposalId,
  onStatusChange,
  onApplied
}) => {
  const [proposal, setProposal] = useState<ChangeProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchProposal();
  }, [proposalId]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      setError(null);

      const proposal = await ChangeProposalService.getProposal(proposalId);
      setProposal(proposal);
    } catch (error) {
      console.error('Error fetching proposal:', error);
      setError('Failed to load proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setSubmitting(true);

      await ChangeProposalService.addComment(proposalId, comment);
      setComment('');

      // Refresh proposal
      await fetchProposal();
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewProposal = async (status: ProposalStatus) => {
    try {
      setSubmitting(true);

      await ChangeProposalService.reviewProposal(proposalId, status, comment);
      setComment('');

      // Refresh proposal
      await fetchProposal();

      // Call onStatusChange callback if provided
      if (onStatusChange) {
        onStatusChange(status);
      }
    } catch (error) {
      console.error('Error reviewing proposal:', error);
      setError('Failed to review proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenApplyDialog = () => {
    setApplyDialogOpen(true);
  };

  const handleCloseApplyDialog = () => {
    setApplyDialogOpen(false);
  };

  const handleApplyProposal = async () => {
    try {
      setSubmitting(true);
      setApplyResult(null);

      const result = await ChangeProposalService.applyProposal(proposalId);

      setApplyResult({
        success: result.success,
        message: result.message
      });

      // Refresh proposal
      await fetchProposal();

      // Call onApplied callback if provided and successful
      if (result.success && onApplied) {
        onApplied();
      }
    } catch (error) {
      console.error('Error applying proposal:', error);
      setApplyResult({
        success: false,
        message: 'Failed to apply proposal. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: ProposalStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case ProposalStatus.PENDING:
        return 'warning';
      case ProposalStatus.APPROVED:
        return 'success';
      case ProposalStatus.REJECTED:
        return 'error';
      case ProposalStatus.MODIFIED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ProposalStatus): string => {
    switch (status) {
      case ProposalStatus.PENDING:
        return 'Pending';
      case ProposalStatus.APPROVED:
        return 'Approved';
      case ProposalStatus.REJECTED:
        return 'Rejected';
      case ProposalStatus.MODIFIED:
        return 'Modified';
      default:
        return status;
    }
  };

  const getEntityTypeName = (type: ProposalEntityType): string => {
    switch (type) {
      case ProposalEntityType.WORLD:
        return 'World';
      case ProposalEntityType.CAMPAIGN:
        return 'Campaign';
      case ProposalEntityType.SESSION:
        return 'Session';
      case ProposalEntityType.CHARACTER:
        return 'Character';
      case ProposalEntityType.LOCATION:
        return 'Location';
      case ProposalEntityType.ITEM:
        return 'Item';
      case ProposalEntityType.EVENT:
        return 'Event';
      case ProposalEntityType.POWER:
        return 'Power';
      case ProposalEntityType.RELATIONSHIP:
        return 'Relationship';
      default:
        return type;
    }
  };

  const getProposalTypeName = (type: ProposalType): string => {
    switch (type) {
      case ProposalType.CREATE:
        return 'Create';
      case ProposalType.UPDATE:
        return 'Update';
      case ProposalType.DELETE:
        return 'Delete';
      case ProposalType.RELATE:
        return 'Relate';
      default:
        return type;
    }
  };

  const formatDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (loading && !proposal) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !proposal) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!proposal) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Proposal not found
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {proposal.title}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label={getStatusLabel(proposal.status)}
              color={getStatusColor(proposal.status)}
            />

            <Chip
              label={getProposalTypeName(proposal.type)}
              variant="outlined"
            />

            <Chip
              label={getEntityTypeName(proposal.entityType)}
              variant="outlined"
            />

            {proposal.entityDetails && (
              <Chip
                label={`Entity: ${proposal.entityDetails.name}`}
                variant="outlined"
              />
            )}

            {proposal.contextDetails && (
              <Chip
                label={`Context: ${proposal.contextDetails.name}`}
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Box>
          {proposal.status === ProposalStatus.APPROVED && (
            <Button
              variant="contained"
              color="success"
              onClick={handleOpenApplyDialog}
              startIcon={<ApproveIcon />}
              disabled={submitting}
              sx={{ ml: 1 }}
            >
              Apply Changes
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant="body1" paragraph>
        {proposal.description}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Reason
      </Typography>
      <Typography variant="body2" paragraph>
        {proposal.reason}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Proposed Changes
      </Typography>

      {proposal.changes.length === 0 && proposal.relationshipChanges?.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No changes proposed
        </Typography>
      )}

      {proposal.changes.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Field Changes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Current Value</TableCell>
                    <TableCell>Proposed Value</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposal.changes.map((change, index) => (
                    <TableRow key={index}>
                      <TableCell>{change.field}</TableCell>
                      <TableCell>
                        {change.oldValue !== undefined ? (
                          typeof change.oldValue === 'object' ? (
                            <pre>{JSON.stringify(change.oldValue, null, 2)}</pre>
                          ) : (
                            String(change.oldValue)
                          )
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            (none)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {typeof change.newValue === 'object' ? (
                          <pre>{JSON.stringify(change.newValue, null, 2)}</pre>
                        ) : (
                          String(change.newValue)
                        )}
                      </TableCell>
                      <TableCell>{change.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      {proposal.relationshipChanges && proposal.relationshipChanges.length > 0 && (
        <Accordion defaultExpanded sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Relationship Changes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell>Relationship</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Properties</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposal.relationshipChanges.map((change, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {change.sourceId} ({getEntityTypeName(change.sourceType)})
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ArrowForwardIcon sx={{ mx: 1 }} />
                          <Typography variant="body2" fontWeight="bold">
                            {change.relationshipType}
                          </Typography>
                          <ArrowForwardIcon sx={{ mx: 1 }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {change.targetId} ({getEntityTypeName(change.targetType)})
                      </TableCell>
                      <TableCell>
                        {change.properties ? (
                          <pre>{JSON.stringify(change.properties, null, 2)}</pre>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            (none)
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>

      {proposal.comments && proposal.comments.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          {proposal.comments.map((comment, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1">{comment.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          No comments yet
        </Typography>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Add a comment"
          value={comment}
          onChange={handleCommentChange}
          disabled={submitting}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="outlined"
            onClick={handleAddComment}
            disabled={!comment.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Add Comment
          </Button>
        </Box>
      </Box>

      {proposal.status === ProposalStatus.PENDING && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleReviewProposal(ProposalStatus.REJECTED)}
            startIcon={submitting ? <CircularProgress size={20} /> : <RejectIcon />}
            disabled={submitting}
          >
            Reject
          </Button>

          <Button
            variant="outlined"
            color="info"
            onClick={() => handleReviewProposal(ProposalStatus.MODIFIED)}
            startIcon={submitting ? <CircularProgress size={20} /> : <EditIcon />}
            disabled={submitting}
          >
            Mark as Modified
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => handleReviewProposal(ProposalStatus.APPROVED)}
            startIcon={submitting ? <CircularProgress size={20} /> : <ApproveIcon />}
            disabled={submitting}
          >
            Approve
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Created {formatDate(proposal.createdAt)}
          {proposal.reviewedAt && ` • Reviewed ${formatDate(proposal.reviewedAt)}`}
        </Typography>
      </Box>

      {/* Apply Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={handleCloseApplyDialog}
        aria-labelledby="apply-dialog-title"
      >
        <DialogTitle id="apply-dialog-title">Apply Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to apply the changes from this proposal? This action will modify the data in your campaign.
          </DialogContentText>

          {applyResult && (
            <Alert
              severity={applyResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {applyResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApplyDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyProposal}
            color="primary"
            disabled={!!submitting || !!(applyResult && applyResult.success)}
            startIcon={submitting ? <CircularProgress size={20} /> : undefined}
          >
            {submitting ? 'Applying...' : 'Apply Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProposalReview;
