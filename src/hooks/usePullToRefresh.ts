import {useCallback, useState} from 'react';
import {useApp} from '../context/AppContext';

/** Shared pull-to-refresh state for screens with their own ScrollView. */
export function usePullToRefresh(customRefresh?: () => void | Promise<void>) {
  const {refreshAppData} = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (customRefresh) {
        await customRefresh();
      } else {
        await refreshAppData();
      }
    } finally {
      setRefreshing(false);
    }
  }, [customRefresh, refreshAppData]);

  return {refreshing, onRefresh};
}
