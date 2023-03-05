import { Row, Col, Button } from 'antd';
import { Faucet, GasGauge } from 'eth-components/ant';
import { useEthersAppContext } from 'eth-hooks/context';
import React, { FC, ReactNode, Suspense } from 'react';

import { Ramp, getFaucetAvailable, ThemeSwitcher } from '~common/components';
import { networkDefinitions } from '~common/constants';
import { getNetworkInfo } from '~common/functions';
import { IScaffoldAppProviders } from '~common/models';
import { FAUCET_ENABLED } from '~~/config/nextjsApp.config';
import { TAppProps } from '~~/models/TAppProps';

export interface IMainPageFooterProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  price: number;
  children?: ReactNode;
  appProps: TAppProps;
}

/**
 * 🗺 Footer: Extra UI like gas price, eth price, faucet, and support:
 * @param props
 * @returns
 */
export const MainPageFooter: FC<IMainPageFooterProps> = (props) => {
  // passed in by nextjs getInitalProps
  const appProps: TAppProps = props.appProps;

  const ethersAppContext = useEthersAppContext();

  // Faucet Tx can be used to send funds from the faucet
  const faucetAvailable = getFaucetAvailable(props.scaffoldAppProviders, ethersAppContext, FAUCET_ENABLED);

  const network = getNetworkInfo(ethersAppContext.chainId);

  const left = (
    <div
      style={{
        position: 'fixed',
        textAlign: 'left',
        left: 0,
        bottom: 20,
        padding: 10,
      }}>
    </div>
  );

  const right = <ThemeSwitcher />;

  return (
    <>
      <Suspense fallback={<div></div>}>{right}</Suspense>
    </>
  );
};
