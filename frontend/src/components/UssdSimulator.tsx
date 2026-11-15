import React, { useState, useEffect } from 'react';
import { 
  Phone, Send, PhoneOff, MessageSquare, RotateCcw, 
  Sparkles, Globe, Volume2, ShieldAlert, CheckCircle 
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import { SMSLog } from '../types/index.js';

export const UssdSimulator: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('+256701334455');
  const [sessionId, setSessionId] = useState<string>(() => `SES-${Date.now()}`);
  
  // USSD Session state
  const [isActiveCall, setIsActiveCall] = useState<boolean>(false);
  const [screenText, setScreenText] = useState<string>('DIAL *284#\nFOR CLINIC PORTAL');
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [ussdHistory, setUssdHistory] = useState<string[]>([]); // Sequence of choices: e.g. ["1", "2", "1"]
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTerminal, setIsTerminal] = useState<boolean>(false);

  // SMS Logs for this phone
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [activeTab, setActiveTab] = useState<'screen' | 'sms'>('screen');

  // Load SMS logs periodically
  const fetchSmsLogs = async () => {
    try {
      const logs = await ApiService.getSmsLogs(phoneNumber);
      setSmsLogs(logs);
    } catch (err) {
      console.error('Failed to load SMS logs:', err);
    }
  };

  useEffect(() => {
    fetchSmsLogs();
    const interval = setInterval(fetchSmsLogs, 5000);
    return () => clearInterval(interval);
  }, [phoneNumber]);

  // Handle Keypad Press
  const handleKeyPress = (val: string) => {
    if (!isActiveCall && val === 'CALL') {
      startUssdSession();
      return;
    }
    if (val === 'END') {
      endSession();
      return;
    }
    if (val === 'CLR') {
      setInputBuffer(prev => prev.slice(0, -1));
      return;
    }
    if (isActiveCall && !isTerminal) {
      setInputBuffer(prev => prev + val);
    } else if (!isActiveCall) {
      // Typing number before call
      setInputBuffer(prev => prev + val);
    }
  };

  // Start USSD Session
  const startUssdSession = async () => {
    const dialCode = inputBuffer.trim() || '*284#';
    if (!dialCode.includes('*284#')) {
      setScreenText('UNKNOWN USSD CODE.\nPLEASE DIAL *284#');
      return;
    }

    const newSessionId = `SES-${Date.now()}`;
    setSessionId(newSessionId);
    setUssdHistory([]);
    setInputBuffer('');
    setIsActiveCall(true);
    setIsTerminal(false);
    setIsLoading(true);

    try {
      const response = await ApiService.postUssd(newSessionId, phoneNumber, '');
      handleUssdResponse(response);
    } catch (err: any) {
      setScreenText('CONNECTION ERROR.\nUNABLE TO REACH GATEWAY.');
      setIsTerminal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit next USSD response
  const handleSendInput = async () => {
    if (!isActiveCall || isTerminal || !inputBuffer.trim()) return;

    const currentChoice = inputBuffer.trim();
    const updatedHistory = [...ussdHistory, currentChoice];
    const fullTextPayload = updatedHistory.join('*');

    setInputBuffer('');
    setIsLoading(true);

    try {
      const response = await ApiService.postUssd(sessionId, phoneNumber, fullTextPayload);
      setUssdHistory(updatedHistory);
      handleUssdResponse(response);
    } catch (err: any) {
      setScreenText('NETWORK ERROR.\nTRY AGAIN.');
      setIsTerminal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUssdResponse = (raw: string) => {
    if (raw.startsWith('CON ')) {
      setScreenText(raw.substring(4));
      setIsTerminal(false);
    } else if (raw.startsWith('END ')) {
      setScreenText(raw.substring(4));
      setIsTerminal(true);
      // Trigger instant check for SMS confirmation
      setTimeout(fetchSmsLogs, 1500);
    } else {
      setScreenText(raw);
    }
  };

  const endSession = () => {
    setIsActiveCall(false);
    setIsTerminal(false);
    setInputBuffer('');
    setUssdHistory([]);
    setScreenText('DIAL *284#\nFOR CLINIC PORTAL');
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
          <Phone className="w-3.5 h-3.5" />
          <span>Channel B: 2G GSM Feature Phone Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Interactive USSD & SMS Simulator
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Test dialing the official <span className="font-mono font-bold text-amber-700">*284#</span> shortcode as used by public health patients without internet or smartphones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PHONE REPLICA */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-80 bg-slate-800 rounded-[40px] p-5 shadow-2xl border-4 border-slate-700 relative">
            
            {/* Speaker Grille */}
            <div className="w-16 h-1.5 bg-slate-600 rounded-full mx-auto mb-4" />

            {/* Screen Bezel */}
            <div className="bg-slate-900 p-3 rounded-2xl border-2 border-slate-700 mb-4 shadow-inner">
              
              {/* Retro Monochrome LCD Display */}
              <div className="bg-[#9bc266] rounded-xl p-3 h-52 flex flex-col justify-between text-slate-950 font-retro shadow-inner border border-[#83a950] relative overflow-hidden">
                
                {/* LCD Status Header */}
                <div className="flex justify-between items-center text-[13px] border-b border-slate-950/20 pb-1 font-bold">
                  <span>AIRTEL / MTN UG</span>
                  <span>{isActiveCall ? '● USSD IN PROGRESS' : '■ READY'}</span>
                </div>

                {/* Main LCD Text */}
                <div className="flex-1 py-2 overflow-y-auto whitespace-pre-line text-sm leading-tight font-extrabold tracking-wide">
                  {isLoading ? 'Requesting *284# ...' : screenText}
                </div>

                {/* Input Prompt bar */}
                {isActiveCall && !isTerminal && (
                  <div className="flex items-center space-x-1 border-t border-slate-950/30 pt-1">
                    <span className="text-xs font-bold">&gt;</span>
                    <input
                      type="text"
                      value={inputBuffer}
                      onChange={(e) => setInputBuffer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendInput()}
                      placeholder="Type option (e.g. 1)"
                      autoFocus
                      className="bg-transparent border-none outline-none text-slate-950 font-retro text-sm font-black w-full"
                    />
                  </div>
                )}

                {/* Dial screen bar when idle */}
                {!isActiveCall && (
                  <div className="border-t border-slate-950/20 pt-1 text-xs font-bold text-center">
                    Input: {inputBuffer || '*284#'}
                  </div>
                )}
              </div>

            </div>

            {/* Action Softkeys (Call / Send & End / Clear) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={isActiveCall ? handleSendInput : startUssdSession}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>{isActiveCall ? 'SEND / OK' : 'CALL *284#'}</span>
              </button>

              <button
                onClick={endSession}
                className="py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
              >
                <PhoneOff className="w-4 h-4" />
                <span>END / CLEAR</span>
              </button>
            </div>

            {/* Numeric Telephone Keypad */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { k: '1', sub: '.,' }, { k: '2', sub: 'ABC' }, { k: '3', sub: 'DEF' },
                { k: '4', sub: 'GHI' }, { k: '5', sub: 'JKL' }, { k: '6', sub: 'MNO' },
                { k: '7', sub: 'PQRS' }, { k: '8', sub: 'TUV' }, { k: '9', sub: 'WXYZ' },
                { k: '*', sub: 'code' }, { k: '0', sub: '+' }, { k: '#', sub: 'hash' }
              ].map(btn => (
                <button
                  key={btn.k}
                  onClick={() => handleKeyPress(btn.k)}
                  className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-xl py-2 px-1 text-white shadow transition flex flex-col items-center justify-center border border-slate-600"
                >
                  <span className="font-extrabold text-base leading-none">{btn.k}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">{btn.sub}</span>
                </button>
              ))}
            </div>

            {/* Bottom branding */}
            <div className="text-center mt-4">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                Obulamu GSM-284
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Simulator Controls & Africa's Talking SMS Feed */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Quick Presets for Demo */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Simulated SIM Card & Quick Dial Shortcuts</span>
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Virtual Patient SIM Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-mono font-bold focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Changing this number tests new patient vs existing patient language persistence.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  setInputBuffer('*284#');
                  startUssdSession();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition"
              >
                1. Dial *284#
              </button>
              <button
                onClick={() => {
                  setInputBuffer('1');
                  handleSendInput();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
              >
                2. Press 1 (Book)
              </button>
              <button
                onClick={() => {
                  setInputBuffer('1');
                  handleSendInput();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
              >
                3. Press 1 (Facility)
              </button>
              <button
                onClick={() => {
                  setInputBuffer('4');
                  handleSendInput();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 hover:bg-teal-200 transition"
              >
                Change Language (Oluganda)
              </button>
            </div>
          </div>

          {/* Africa's Talking Outbound SMS Live Stream */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Africa's Talking SMS Feed
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Gateway
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Outbound SMS notifications triggered automatically upon USSD slot booking or 24-hour reminder cron:
            </p>

            {smsLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No SMS logs recorded yet. Book an appointment through USSD or the Android app to see automated SMS confirmations.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {smsLogs.map(log => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 font-mono">
                        {log.phoneNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium whitespace-pre-wrap">
                      {log.message}
                    </p>
                    <div className="mt-2 pt-1 border-t border-amber-200/40 flex justify-between text-[10px] text-slate-400">
                      <span>Status: <strong className="text-emerald-700">{log.status}</strong></span>
                      <span>Ref: {log.providerId}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t text-center">
              <button
                onClick={fetchSmsLogs}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Refresh SMS logs
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

