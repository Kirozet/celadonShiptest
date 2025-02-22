import { useBackend, useSharedState } from '../../backend';
import {
  ProgressBar,
  Section,
  Tabs,
  Button,
  LabeledList,
  Box,
  Stack,
} from '../../components';
import { Window } from '../../layouts';

import { CargoCatalog } from './Catalog';
import { Mission, Data } from './types';

export const OutpostCommunicationsFactionSolfed = (props, context) => {
  const { act, data } = useBackend<Data>(context);
  const { outpostDocked, onShip, points } = data;
  const [tab, setTab] = useSharedState(context, 'outpostTab', '');
  return (
    <Window theme="solfed" width={600} height={700} resizable>
      <Window.Content scrollable>
        <Section
          title={Math.round(points) + ' credits'}
          buttons={
            <Stack textAlign="center">
              <Stack.Item>
                <Tabs>
                  <Tabs.Tab
                    selected={tab === 'cargo'}
                    onClick={() => setTab('cargo')}
                  >
                    Cargo
                  </Tabs.Tab>
                </Tabs>
              </Stack.Item>
              <Stack.Item>
                <Button.Input
                  content="Withdraw Cash"
                  currentValue={100}
                  defaultValue={100}
                  onCommit={(e, value) =>
                    act('withdrawCash', {
                      value: value,
                    })
                  }
                />
              </Stack.Item>
            </Stack>
          }
        />
        {tab === 'cargo' && <CargoExpressContent />}
      </Window.Content>
    </Window>
  );
};

const CargoExpressContent = (props, context) => {
  const { act, data } = useBackend<Data>(context);
  const {
    beaconZone,
    beaconName,
    hasBeacon,
    usingBeacon,
    printMsg,
    canBuyBeacon,
    message,
  } = data;
  return (
    <>
      <Section title="Cargo Express">
        <LabeledList>
          <LabeledList.Item label="Landing Location">
            <Button
              content="Cargo Bay"
              selected={!usingBeacon}
              onClick={() => act('LZCargo')}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Notice">{message}</LabeledList.Item>
        </LabeledList>
      </Section>
      <CargoCatalog />
    </>
  );
};

const ShipMissionsContent = (props, context) => {
  const { data } = useBackend<Data>(context);
  const { numMissions, maxMissions, outpostDocked, shipMissions } = data;
  return (
    <Section title={'Current Missions ' + numMissions + '/' + maxMissions}>
      <MissionsList showButton={outpostDocked} missions={shipMissions} />
    </Section>
  );
};

const OutpostMissionsContent = (props, context) => {
  const { data } = useBackend<Data>(context);
  const { numMissions, maxMissions, outpostDocked, outpostMissions } = data;
  const disabled = numMissions >= maxMissions;
  return (
    <Section title={'Available Missions ' + numMissions + '/' + maxMissions}>
      <MissionsList
        showButton={outpostDocked}
        missions={outpostMissions}
        disabled={disabled}
        tooltip={(disabled && 'You have too many missions!') || null}
      />
    </Section>
  );
};

const MissionsList = (props, context) => {
  const showButton = props.showButton as Boolean;
  const disabled = props.disabled as Boolean;
  const tooltip = props.tooltip as string;
  const missionsArray = props.missions as Array<Mission>;
  const { act } = useBackend(context);
  //   const { numMissions, maxMissions } = data;

  const buttonJSX = (mission: Mission, tooltip: string, disabled: Boolean) => {
    return (
      <Button
        disabled={disabled}
        tooltip={tooltip}
        onClick={() =>
          act('mission-act', {
            ref: mission.ref,
          })
        }
      >
        {mission.actStr}
      </Button>
    );
  };

  const missionValues = (mission: Mission) => (
    <Stack vertical>
      <Stack.Item>
        <Box inline mx={1}>
          {`${mission.value} cr, completed: ${mission.progressStr}`}
        </Box>
      </Stack.Item>

      <Stack.Item>
        <ProgressBar
          ranges={{
            good: [0.75, 1],
            average: [0.25, 0.75],
            bad: [0, 0.25],
          }}
          value={mission.remaining / mission.duration}
        >
          {mission.timeStr}
        </ProgressBar>
      </Stack.Item>

      <Stack.Item>
        {(showButton && buttonJSX(mission, tooltip, disabled)) || undefined}
      </Stack.Item>
    </Stack>
  );

  const missionJSX = missionsArray.map((mission: Mission) => (
    <>
      <LabeledList.Item
        verticalAlign="top"
        labelWrap
        label={mission.name}
        buttons={missionValues(mission)}
      >
        {mission.desc}
      </LabeledList.Item>
      <LabeledList.Divider />
    </>
  ));

  return <LabeledList>{missionJSX}</LabeledList>;
};
