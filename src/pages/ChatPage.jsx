import AppShell from '../components/layout/AppShell';
import NewChatModal from '../components/modals/NewChatModal';
import NewGroupModal from '../components/modals/NewGroupModal';
import AddMemberModal from '../components/modals/AddMemberModal';
import ProfileModal from '../components/modals/ProfileModal';
import SearchModal from '../components/modals/SearchModal';
import JoinGroupModal from '../components/modals/JoinGroupModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import useUiStore from '../store/uiStore';

export default function ChatPage() {
  const { activeModal } = useUiStore();

  return (
    <>
      <AppShell />
      {activeModal === 'newChat' && <NewChatModal />}
      {activeModal === 'newGroup' && <NewGroupModal />}
      {activeModal === 'addMember' && <AddMemberModal />}
      {activeModal === 'profile' && <ProfileModal />}
      {activeModal === 'search' && <SearchModal />}
      {activeModal === 'joinGroup' && <JoinGroupModal />}
      {activeModal === 'confirm' && <ConfirmModal />}
    </>
  );
}
