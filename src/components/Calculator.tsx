import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CalcButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'function' | 'operator';
  className?: string;
  active?: boolean;
}

function CalcButton({ children, onClick, variant = 'number', className = '', active = false }: CalcButtonProps) {
  const baseClasses = "relative rounded-full flex items-center justify-center transition-all duration-200 select-none cursor-pointer";
  
  const variantClasses = {
    number: `bg-gray-200 hover:bg-gray-300 active:bg-gray-100 text-gray-900 ${active ? 'bg-gray-300' : ''}`,
    function: `bg-gray-300 hover:bg-gray-400 active:bg-gray-200 text-gray-900 ${active ? 'bg-gray-400' : ''}`,
    operator: `bg-[#ff9f0a] hover:bg-[#ffb143] active:bg-[#e68a00] text-white ${active ? 'bg-white !text-[#ff9f0a]' : ''}`
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [error, setError] = useState(false);

  const handleNumber = (num: string) => {
    setError(false);
    
    if (shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      if (display.length >= 9) return;
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    setError(false);
    
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
    } else if (!display.includes('.')) {
      if (display.length >= 9) return;
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    setError(false);
    
    if (previousValue !== null && operation && !shouldResetDisplay) {
      calculate();
    }
    
    setPreviousValue(display);
    setOperation(op);
    setShouldResetDisplay(true);
  };

  const calculate = () => {
    if (previousValue === null || operation === null) return;
    
    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        if (current === 0) {
          setError(true);
          setDisplay('Error');
          setPreviousValue(null);
          setOperation(null);
          setShouldResetDisplay(true);
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }

    let formattedResult: string;
    if (Number.isInteger(result)) {
      formattedResult = result.toString();
    } else {
      formattedResult = parseFloat(result.toFixed(8)).toString();
    }
    
    if (formattedResult.length > 9) {
      formattedResult = parseFloat(result.toPrecision(9)).toString();
    }
    
    setDisplay(formattedResult);
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(true);
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
    setError(false);
  };

  const toggleSign = () => {
    if (display === '0' || error) return;
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  };

  const percentage = () => {
    if (error) return;
    const value = parseFloat(display);
    const result = value / 100;
    setDisplay(result.toString());
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (error && e.key !== 'Escape' && e.key !== 'c' && e.key !== 'C') {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.' || e.key === ',') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperation('+');
      } else if (e.key === '-') {
        handleOperation('-');
      } else if (e.key === '*') {
        handleOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clear();
      } else if (e.key === '%') {
        percentage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, operation, shouldResetDisplay, error]);

  const getFontSize = () => {
    const length = display.length;
    if (length <= 6) return 'text-7xl';
    if (length <= 7) return 'text-6xl';
    if (length <= 8) return 'text-5xl';
    return 'text-4xl';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[320px]"
      >
        {/* Calculator Container */}
        <div className="bg-white rounded-[2.5rem] p-5 shadow-2xl shadow-gray-400/20">
          {/* Display */}
          <div className="px-4 py-10 mb-2 min-h-[140px] flex items-end justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={display}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className={`text-right text-gray-900 ${getFontSize()} tracking-tight leading-tight`}
                style={{ 
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
                  fontWeight: 200,
                  letterSpacing: '-0.02em'
                }}
              >
                {display}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <CalcButton onClick={clear} variant="function">
              AC
            </CalcButton>
            <CalcButton onClick={toggleSign} variant="function">
              +/−
            </CalcButton>
            <CalcButton onClick={percentage} variant="function">
              %
            </CalcButton>
            <CalcButton 
              onClick={() => handleOperation('÷')} 
              variant="operator"
              active={operation === '÷'}
            >
              ÷
            </CalcButton>

            {/* Row 2 */}
            <CalcButton onClick={() => handleNumber('7')}>
              7
            </CalcButton>
            <CalcButton onClick={() => handleNumber('8')}>
              8
            </CalcButton>
            <CalcButton onClick={() => handleNumber('9')}>
              9
            </CalcButton>
            <CalcButton 
              onClick={() => handleOperation('×')} 
              variant="operator"
              active={operation === '×'}
            >
              ×
            </CalcButton>

            {/* Row 3 */}
            <CalcButton onClick={() => handleNumber('4')}>
              4
            </CalcButton>
            <CalcButton onClick={() => handleNumber('5')}>
              5
            </CalcButton>
            <CalcButton onClick={() => handleNumber('6')}>
              6
            </CalcButton>
            <CalcButton 
              onClick={() => handleOperation('-')} 
              variant="operator"
              active={operation === '-'}
            >
              −
            </CalcButton>

            {/* Row 4 */}
            <CalcButton onClick={() => handleNumber('1')}>
              1
            </CalcButton>
            <CalcButton onClick={() => handleNumber('2')}>
              2
            </CalcButton>
            <CalcButton onClick={() => handleNumber('3')}>
              3
            </CalcButton>
            <CalcButton 
              onClick={() => handleOperation('+')} 
              variant="operator"
              active={operation === '+'}
            >
              +
            </CalcButton>

            {/* Row 5 */}
            <CalcButton onClick={() => handleNumber('0')} className="col-span-2 !rounded-full !justify-start !pl-8">
              0
            </CalcButton>
            <CalcButton onClick={handleDecimal}>
              ,
            </CalcButton>
            <CalcButton onClick={calculate} variant="operator">
              =
            </CalcButton>
          </div>

          {/* Keyboard hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-500 text-xs mt-4"
          >
            Поддерживается ввод с клавиатуры
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
