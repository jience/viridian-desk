import ControlWindow from '@/components/ControlWindow';
import Footer from '@/components/Footer';
import '@/styles/design-system.css';
import { DocumentTitle } from '@/ui/shell/document-title';
import { useMessageFormatter } from '@/utils/message-format';
import { LoginGatewayDock } from '@/components/LoginGatewayDock';
import { LoginAuthPanel } from './LoginAuthPanel';
import { LoginBrandPanel } from './LoginBrandPanel';
import './LoginPage.scss';

export default function LoginPage() {
  const { formatMessage } = useMessageFormatter();

  return (
    <div className="auth-page">
      <DocumentTitle title={formatMessage({ id: 'LOGIN' })} />
      <div className="auth-page__drag-region" data-tauri-drag-region />
      <div className="auth-page__controls">
        <ControlWindow />
      </div>
      <section className="auth-page__window">
        <LoginBrandPanel />
        <LoginAuthPanel />
      </section>
      <div className="auth-page__footer-bar">
        <Footer rightSlot={<LoginGatewayDock />} />
      </div>
    </div>
  );
}
