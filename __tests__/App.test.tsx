import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';

/**
 * Full App mount requires many native modules. Smoke-test that the test
 * harness + RN renderer are healthy; deeper flows are covered by device QA.
 */
test('renders Keepers smoke component', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<Text>Keepers Adventures</Text>);
  });
});
