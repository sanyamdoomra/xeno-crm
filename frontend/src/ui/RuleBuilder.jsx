import React from 'react';
import { Box, Button, Select, MenuItem, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const fields = [
  { label: 'Total Spend', value: 'totalSpend' },
  { label: 'Visits', value: 'visits' },
  { label: 'Last Active', value: 'lastActive' }
];
const operators = [
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '=', value: '=' }
];

export default function RuleBuilder({ rules, setRules, logic, setLogic }) {
  const addRule = () => setRules([...rules, { field: '', operator: '', value: '' }]);
  const updateRule = (idx, key, value) => {
    const updated = [...rules];
    updated[idx][key] = value;
    setRules(updated);
  };
  const removeRule = idx => setRules(rules.filter((_, i) => i !== idx));

  return (
    <Box>
      <Box mb={2}>
        <Select value={logic} onChange={e => setLogic(e.target.value)}>
          <MenuItem value="AND">AND</MenuItem>
          <MenuItem value="OR">OR</MenuItem>
        </Select>
      </Box>
      {rules.map((rule, idx) => (
        <Box key={idx} display="flex" alignItems="center" mb={1}>
          <Select
            value={rule.field}
            onChange={e => updateRule(idx, 'field', e.target.value)}
            sx={{ mr: 1 }}
          >
            {fields.map(f => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
          </Select>
          <Select
            value={rule.operator}
            onChange={e => updateRule(idx, 'operator', e.target.value)}
            sx={{ mr: 1 }}
          >
            {operators.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
          <TextField
            value={rule.value}
            onChange={e => updateRule(idx, 'value', e.target.value)}
            placeholder="Value"
            sx={{ mr: 1, width: 100 }}
          />
          <IconButton onClick={() => removeRule(idx)}><DeleteIcon /></IconButton>
        </Box>
      ))}
      <Button onClick={addRule} variant="outlined">Add Rule</Button>
    </Box>
  );
}
