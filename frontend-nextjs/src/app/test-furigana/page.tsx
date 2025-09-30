'use client';

import { Furigana } from '@/components/japanese/furigana';

export default function TestFuriganaPage() {
  const testCases = [
    { kanji: '漢字', furigana: 'かんじ' },
    { kanji: '日本語', furigana: 'にほんご' },
    { kanji: '勉強', furigana: 'べんきょう' },
    { kanji: '学校', furigana: 'がっこう' }
  ];

  const modes: Array<{ mode: 'hover' | 'inline' | 'brackets' | 'ruby'; label: string }> = [
    { mode: 'hover', label: 'Hover Mode' },
    { mode: 'inline', label: 'Inline Mode' },
    { mode: 'brackets', label: 'Brackets Mode' },
    { mode: 'ruby', label: 'Ruby Mode' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Furigana Implementation Test</h1>
      
      {testCases.map((testCase, testIndex) => (
        <div key={testIndex} className="mb-8 p-6 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">
            Test Case {testIndex + 1}: {testCase.kanji} ({testCase.furigana})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modes.map(({ mode, label }) => (
              <div key={mode} className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-medium mb-3 text-green-300">{label}</h3>
                <div className="text-2xl mb-2">
                  <Furigana
                    kanji={testCase.kanji}
                    furigana={testCase.furigana}
                    mode={mode}
                    showFurigana={true}
                    className="text-white"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  Mode: {mode} | Expected: {getExpectedOutput(testCase.kanji, testCase.furigana, mode)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Expected Outputs</h3>
        <div className="space-y-2 text-sm font-mono">
          <div><span className="text-green-400">Hover:</span> Kanji only, furigana appears on hover</div>
          <div><span className="text-green-400">Inline:</span> 漢字「かんじ」</div>
          <div><span className="text-green-400">Brackets:</span> 漢「かん」字「じ」</div>
          <div><span className="text-green-400">Ruby:</span> &lt;ruby&gt;漢字&lt;rt&gt;かんじ&lt;/rt&gt;&lt;/ruby&gt;</div>
        </div>
      </div>
    </div>
  );
}

function getExpectedOutput(kanji: string, furigana: string, mode: string): string {
  switch (mode) {
    case 'hover':
      return 'Kanji only, hover for furigana';
    case 'inline':
      return `${kanji}「${furigana}」`;
    case 'brackets':
      return 'Character-by-character with brackets';
    case 'ruby':
      return 'HTML ruby annotation';
    default:
      return 'Unknown mode';
  }
}
