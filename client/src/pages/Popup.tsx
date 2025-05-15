import React, { useState, useEffect } from 'react';
import { DateRange, Range } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function Popup() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [range, setRange] = useState<Range[]>([
    { startDate: new Date(), endDate: new Date(), key: 'selection' }
  ]);

  useEffect(() => {
    const e = localStorage.getItem('popupEnabled');
    const s = localStorage.getItem('popupStart');
    const en = localStorage.getItem('popupEnd');
    setEnabled(e === 'true');
    if (s && en) {
      setRange([{ startDate: new Date(s), endDate: new Date(en), key: 'selection' }]);
    }
  }, []);

  const toggleEnabled = () => {
    const v = !enabled;
    setEnabled(v);
    localStorage.setItem('popupEnabled', v.toString());
  };

  const onRangeChange = (item: any) => {
    const sel = item.selection;
    setRange([sel]);
    localStorage.setItem('popupStart', sel.startDate.toISOString());
    localStorage.setItem('popupEnd', sel.endDate.toISOString());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Popup</h1>
      <div className="flex items-center mb-4">
        <label className="mr-2">Enable Popup:</label>
        <input type="checkbox" checked={enabled} onChange={toggleEnabled} />
      </div>
      <div>
        <label className="block mb-2">Select Date Range:</label>
        <DateRange
          editableDateInputs={true}
          onChange={onRangeChange}
          moveRangeOnFirstSelection={false}
          ranges={range}
        />
      </div>
    </div>
  );
}
