import ControlWindow from '@/features/shell/components/control-window';
import Footer from '@/features/shell/components/footer';
import '@/styles/design-system.css';
import { DocumentTitle } from '@/shared/ui/shell/document-title';
import { useMessageFormatter } from '@/utils/message-format';
import { LoginGatewayDock } from '@/features/shell/components/gateway-dock';
import { LoginAuthPanel } from '../components/login-auth-panel';
import { LoginBrandPanel } from '../components/login-brand-panel';
import './login-page.scss';

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
