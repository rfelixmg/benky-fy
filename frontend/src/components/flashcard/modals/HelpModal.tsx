import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WordInfo {
  reading?: string;
  meaning?: string;
  examples?: Array<{
    japanese: string;
    english: string;
  }>;
  notes?: string[];
  grammar_points?: Array<{
    point: string;
    explanation: string;
  }>;
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordInfo?: WordInfo;
  isLoading?: boolean;
  error?: Error;
}

export function HelpModal({
  isOpen,
  onClose,
  wordInfo,
  isLoading = false,
  error,
}: HelpModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2"
                    >
                      Word Information
                    </Dialog.Title>

                    {isLoading ? (
                      <div className="mt-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                      </div>
                    ) : error ? (
                      <div className="mt-4 text-center text-red-600">
                        <p>{error.message}</p>
                        <button
                          onClick={onClose}
                          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    ) : wordInfo ? (
                      <div className="mt-4 space-y-4">
                        {wordInfo.reading && (
                          <div>
                            <h4 className="font-medium text-gray-700">Reading</h4>
                            <p className="mt-1 text-gray-900">{wordInfo.reading}</p>
                          </div>
                        )}

                        {wordInfo.meaning && (
                          <div>
                            <h4 className="font-medium text-gray-700">Meaning</h4>
                            <p className="mt-1 text-gray-900">{wordInfo.meaning}</p>
                          </div>
                        )}

                        {wordInfo.examples && wordInfo.examples.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700">Examples</h4>
                            <div className="mt-2 space-y-2">
                              {wordInfo.examples.map((example, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-3 rounded-md"
                                >
                                  <p className="text-gray-900 font-medium">
                                    {example.japanese}
                                  </p>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {example.english}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {wordInfo.grammar_points && wordInfo.grammar_points.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700">Grammar Points</h4>
                            <div className="mt-2 space-y-3">
                              {wordInfo.grammar_points.map((point, index) => (
                                <div key={index}>
                                  <p className="text-gray-900 font-medium">
                                    {point.point}
                                  </p>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {point.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {wordInfo.notes && wordInfo.notes.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700">Notes</h4>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                              {wordInfo.notes.map((note, index) => (
                                <li key={index} className="text-gray-600">
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 text-center text-gray-500">
                        No information available for this word.
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}