import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StatusSelect from '../components/tasks/StatusSelect.jsx';

describe('StatusSelect', () => {
  it('lists only the current and the valid next statuses', () => {
    render(<StatusSelect current="Todo" allowed={['In Progress', 'Cancelled']} onChange={() => {}} />);
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Todo', 'In Progress', 'Cancelled']);
  });
  it('is disabled for final statuses', () => {
    render(<StatusSelect current="Completed" allowed={[]} onChange={() => {}} />);
    expect(screen.getByLabelText('Task status')).toBeDisabled();
  });
  it('reports the chosen status', async () => {
    const onChange = vi.fn();
    render(<StatusSelect current="In Progress" allowed={['Completed', 'Cancelled']} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Task status'), 'Completed');
    expect(onChange).toHaveBeenCalledWith('Completed');
  });
});
