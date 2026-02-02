import React, { useState } from 'react';
import { Bold, Italic, Plus, Trash, PaintBucket } from 'lucide-react';
import { TableCell } from '../types';

interface ExcelGridProps {
  data: TableCell[][];
  onChange: (newData: TableCell[][]) => void;
  readOnly?: boolean;
}

const COLORS = ['#ffffff', '#fee2e2', '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff'];

const ExcelGrid: React.FC<ExcelGridProps> = ({ data, onChange, readOnly = false }) => {
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);

  // Helper to ensure data is always TableCell structure, even if passed old string[][]
  const safeData = data.map(row => row.map(cell => 
    typeof cell === 'string' ? { value: cell } : cell
  ));

  const updateCell = (r: number, c: number, updates: Partial<TableCell>) => {
    if (readOnly) return;
    const newData = [...safeData.map(row => [...row])];
    newData[r][c] = { ...newData[r][c], ...updates };
    onChange(newData);
  };

  const handlePaste = (e: React.ClipboardEvent, startR: number, startC: number) => {
    if (readOnly) return;
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('text');
    const rows = clipboardData.split('\n');
    
    const newData = [...safeData.map(row => [...row])];
    
    rows.forEach((rowStr, i) => {
      if (!rowStr && i === rows.length - 1) return; // Skip trailing newline
      const cells = rowStr.split('\t');
      cells.forEach((val, j) => {
        const r = startR + i;
        const c = startC + j;
        // Extend grid if needed (simple version: only if row exists)
        if (newData[r] && newData[r][c]) {
           newData[r][c] = { ...newData[r][c], value: val.trim() };
        }
      });
    });
    onChange(newData);
  };

  const addRow = () => {
    if (readOnly) return;
    const cols = safeData[0].length;
    const newRow = Array(cols).fill(null).map(() => ({ value: '' }));
    onChange([...safeData, newRow]);
  };

  const addColumn = () => {
    if (readOnly) return;
    const newData = safeData.map(row => [...row, { value: '' }]);
    onChange(newData);
  };

  const toggleStyle = (styleKey: 'bold' | 'italic') => {
    if (!selectedCell || readOnly) return;
    const { r, c } = selectedCell;
    const currentStyle = safeData[r][c].style || {};
    updateCell(r, c, { style: { ...currentStyle, [styleKey]: !currentStyle[styleKey] } });
  };

  const setColor = (color: string) => {
    if (!selectedCell || readOnly) return;
    const { r, c } = selectedCell;
    const currentStyle = safeData[r][c].style || {};
    updateCell(r, c, { style: { ...currentStyle, backgroundColor: color } });
  };

  return (
    <div className="flex flex-col gap-2">
      {!readOnly && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-xs font-bold text-gray-500 mr-2">Форматирование:</span>
          <button 
            onClick={() => toggleStyle('bold')} 
            className={`p-1.5 rounded hover:bg-gray-200 ${selectedCell && safeData[selectedCell.r][selectedCell.c].style?.bold ? 'bg-gray-300' : ''}`}
            disabled={!selectedCell}
          >
            <Bold size={14} />
          </button>
          <button 
            onClick={() => toggleStyle('italic')} 
            className={`p-1.5 rounded hover:bg-gray-200 ${selectedCell && safeData[selectedCell.r][selectedCell.c].style?.italic ? 'bg-gray-300' : ''}`}
            disabled={!selectedCell}
          >
            <Italic size={14} />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <div className="flex gap-1">
             {COLORS.map(color => (
               <button
                 key={color}
                 onClick={() => setColor(color)}
                 className={`w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform ${selectedCell && safeData[selectedCell.r][selectedCell.c].style?.backgroundColor === color ? 'ring-2 ring-blue-400' : ''}`}
                 style={{ backgroundColor: color }}
               />
             ))}
          </div>
          <div className="flex-1"></div>
          <span className="text-[10px] text-gray-400">Ctrl+V для вставки из Excel</span>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 font-medium select-none">
            <tr>
              <th className="p-2 border border-gray-300 w-10 text-center text-xs">#</th>
              {safeData[0].map((_, i) => (
                <th key={i} className="p-2 border border-gray-300 min-w-[100px] text-center font-normal text-xs text-gray-500">
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeData.map((row, rIndex) => (
              <tr key={rIndex}>
                <td className="p-2 border border-gray-300 bg-gray-50 text-center text-gray-500 font-mono text-xs select-none">
                  {rIndex + 1}
                </td>
                {row.map((cell, cIndex) => (
                  <td 
                    key={cIndex} 
                    className="border border-gray-300 p-0 relative"
                    style={{ backgroundColor: cell.style?.backgroundColor || 'transparent' }}
                  >
                    <input
                      type="text"
                      value={cell.value}
                      readOnly={readOnly}
                      onFocus={() => setSelectedCell({ r: rIndex, c: cIndex })}
                      onChange={(e) => updateCell(rIndex, cIndex, { value: e.target.value })}
                      onPaste={(e) => handlePaste(e, rIndex, cIndex)}
                      className={`w-full h-full p-2 outline-none bg-transparent ${readOnly ? 'cursor-default' : 'focus:ring-2 focus:ring-blue-500 inset-0 z-10'}`}
                      style={{
                        fontWeight: cell.style?.bold ? 'bold' : 'normal',
                        fontStyle: cell.style?.italic ? 'italic' : 'normal',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!readOnly && (
        <div className="flex gap-2">
          <button 
            onClick={addRow}
            className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold hover:bg-gray-100 border border-gray-300 rounded flex items-center gap-1"
          >
            <Plus size={14} /> Строка
          </button>
          <button 
            onClick={addColumn}
            className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold hover:bg-gray-100 border border-gray-300 rounded flex items-center gap-1"
          >
            <Plus size={14} /> Колонка
          </button>
        </div>
      )}
    </div>
  );
};

export default ExcelGrid;