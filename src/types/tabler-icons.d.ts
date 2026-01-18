/**
 * Tabler Icons React - Direct Import Type Declarations
 *
 * Vercel Best Practice: bundle-barrel-imports
 * 직접 import를 위한 타입 선언
 */

declare module '@tabler/icons-react/dist/esm/icons/*.mjs' {
  import { FC, SVGProps } from 'react';
  const Icon: FC<SVGProps<SVGSVGElement>>;
  export default Icon;
}

// 개별 아이콘에 대한 명시적 선언
declare module '@tabler/icons-react/dist/esm/icons/IconX.mjs' {
  import { FC, SVGProps } from 'react';
  const IconX: FC<SVGProps<SVGSVGElement>>;
  export default IconX;
}

declare module '@tabler/icons-react/dist/esm/icons/IconMapPinOff.mjs' {
  import { FC, SVGProps } from 'react';
  const IconMapPinOff: FC<SVGProps<SVGSVGElement>>;
  export default IconMapPinOff;
}

declare module '@tabler/icons-react/dist/esm/icons/IconSettings.mjs' {
  import { FC, SVGProps } from 'react';
  const IconSettings: FC<SVGProps<SVGSVGElement>>;
  export default IconSettings;
}

declare module '@tabler/icons-react/dist/esm/icons/IconChevronLeft.mjs' {
  import { FC, SVGProps } from 'react';
  const IconChevronLeft: FC<SVGProps<SVGSVGElement>>;
  export default IconChevronLeft;
}

declare module '@tabler/icons-react/dist/esm/icons/IconRefresh.mjs' {
  import { FC, SVGProps } from 'react';
  const IconRefresh: FC<SVGProps<SVGSVGElement>>;
  export default IconRefresh;
}

declare module '@tabler/icons-react/dist/esm/icons/IconChevronUp.mjs' {
  import { FC, SVGProps } from 'react';
  const IconChevronUp: FC<SVGProps<SVGSVGElement>>;
  export default IconChevronUp;
}
