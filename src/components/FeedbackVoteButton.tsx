import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ThumbsUp } from 'lucide-react';
import { apiService } from '../services/api';
import { API_ENDPOINTS } from '../constants';
import { cn } from '../lib/utils';

interface FeedbackVoteButtonProps {
  feedbackId: string;
  initialVotes: number;
  onVoteChange?: (newVoteCount: number) => void;
}

export function FeedbackVoteButton({ feedbackId, initialVotes, onVoteChange }: FeedbackVoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingVote, setIsCheckingVote] = useState(true);

  useEffect(() => {
    checkIfVoted();
  }, [feedbackId]);

  const checkIfVoted = async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.FEEDBACK_CHECK_VOTE(feedbackId));
      setHasVoted(response.data.hasVoted);
    } catch (error) {
      console.error('Erro ao verificar voto:', error);
    } finally {
      setIsCheckingVote(false);
    }
  };

  const handleVote = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (hasVoted) {
        const response = await apiService.delete(API_ENDPOINTS.FEEDBACK_VOTE(feedbackId));
        const newVotes = response.data.votes;
        setVotes(newVotes);
        setHasVoted(false);
        onVoteChange?.(newVotes);
      } else {
        const response = await apiService.post(API_ENDPOINTS.FEEDBACK_VOTE(feedbackId));
        const newVotes = response.data.votes;
        setVotes(newVotes);
        setHasVoted(true);
        onVoteChange?.(newVotes);
      }
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao registrar voto';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingVote) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="min-w-[80px]"
      >
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600 mr-2" />
        {votes}
      </Button>
    );
  }

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size="sm"
      onClick={handleVote}
      disabled={isLoading}
      className={cn(
        "min-w-[80px] transition-all duration-200",
        hasVoted && "bg-blue-600 hover:bg-blue-700 text-white"
      )}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
      ) : (
        <ThumbsUp className={cn(
          "h-4 w-4 mr-1",
          hasVoted && "fill-current"
        )} />
      )}
      {votes}
    </Button>
  );
}