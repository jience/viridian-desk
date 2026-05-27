import {
  Check,
  CheckCircle,
  ChevronsUpDown,
  CircleX,
  Copy,
  Edit3,
  Ellipsis,
  FolderOpen,
  Info,
  QrCode,
  RefreshCw,
  Rocket,
  Search,
  Trash2,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

type IconProps = LucideProps & {
  spin?: boolean;
};

const withClass = (Icon: ComponentType<LucideProps>) =>
  function CompatIcon({ className, spin, ...props }: IconProps) {
    return (
      <Icon className={`${className || ''} ${spin ? 'vd-icon-spin' : ''}`.trim()} {...props} />
    );
  };

export const ReloadOutlined = withClass(RefreshCw);
export const SearchOutlined = withClass(Search);
export const DeleteOutlined = withClass(Trash2);
export const CaretDownOutlined = withClass(ChevronsUpDown);
export const InfoCircleFilled = withClass(Info);
export const EllipsisOutlined = withClass(Ellipsis);
export const QrcodeOutlined = withClass(QrCode);
export const CheckCircleFilled = withClass(CheckCircle);
export const CheckCircleOutlined = withClass(CheckCircle);
export const CloseCircleFilled = withClass(CircleX);
export const CopyOutlined = withClass(Copy);
export const RocketOutlined = withClass(Rocket);
export const EditOutlined = withClass(Edit3);
export const FolderOpenOutlined = withClass(FolderOpen);
export const CheckOutlined = withClass(Check);
