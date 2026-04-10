import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FirstLoginDialog from './FirstLoginDialog';

const PENDING_FIRST_LOGIN_WELCOME_KEY = 'pendingFirstLoginWelcome';
const HAS_COMPLETED_ONBOARDING_KEY = 'hasCompletedOnboarding';
const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

function FirstLoginGuard() {
  const { isNewUser, clearIsNewUser } = useAuth();
  const location = useLocation();
  const isInvitePage = location.pathname.startsWith('/invite');
  const isPublicLandingPage = location.pathname === '/';
  const isInviteJoinPage = location.pathname === '/create-player'
    && Boolean(location.state?.inviteToken || sessionStorage.getItem(PENDING_INVITE_TOKEN_KEY));
  const [dismissed, setDismissed] = useState(false);
  const hasCompletedOnboarding = localStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY) === 'true';
  const hasPendingFirstLoginWelcome = sessionStorage.getItem(PENDING_FIRST_LOGIN_WELCOME_KEY) === 'true';
  const suppressForInviteFlow = isInvitePage || isInviteJoinPage;

  useEffect(() => {
    setDismissed(false);
  }, [isNewUser, location.pathname]);

  const show = !dismissed
    && (isNewUser || hasPendingFirstLoginWelcome)
    && !suppressForInviteFlow
    && !isPublicLandingPage
    && !hasCompletedOnboarding;

  const handleClose = () => {
    sessionStorage.removeItem(PENDING_FIRST_LOGIN_WELCOME_KEY);
    localStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, 'true');
    setDismissed(true);
    clearIsNewUser();
  };

  return <FirstLoginDialog open={show} onClose={handleClose} />;
}

export default FirstLoginGuard;
