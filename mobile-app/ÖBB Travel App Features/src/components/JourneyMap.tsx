import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, RotateCcw, X, ThumbsUp, ThumbsDown } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SurveyQuestion {
  id: string;
  triggerAt: number; // percentage of journey
  question: string;
  type: 'rating' | 'yes_no' | 'text';
  answered: boolean;
  answer?: string | number;
}

export function JourneyMap() {
  // Vienna to Salzburg route
  const stations = [
    { name: 'Wien Hbf', coords: [48.1848, 16.3778] as [number, number], time: '14:25', trainType: 'RJ 640' },
    { name: 'Wien Meidling', coords: [48.1674, 16.3458] as [number, number], time: '14:35' },
    { name: 'Melk', coords: [48.2255, 15.3348] as [number, number], time: '15:12' },
    { name: 'Linz Hbf', coords: [48.2848, 14.2931] as [number, number], time: '16:02' },
    { name: 'Salzburg Hbf', coords: [47.6114, 13.0450] as [number, number], time: '17:04', trainType: 'Arrival' },
  ];

  // Total journey is approximately 160 minutes
  const TOTAL_JOURNEY_DURATION = 160; // minutes

  // Generate survey questions based on journey duration
  const generateSurveyQuestions = (): SurveyQuestion[] => {
    const questions: SurveyQuestion[] = [];
    const questionIntervals = Math.max(2, Math.floor(TOTAL_JOURNEY_DURATION / 30)); // 1 question every ~30 minutes

    for (let i = 1; i < questionIntervals; i++) {
      const triggerAt = (i / questionIntervals) * 100;
      const questionTexts = [
        'Are you satisfied with the overall quality of the transport service?',
        'Have delays negatively affected your travel planning?',
        'Have you noticed infrastructure problems that affect your travel experience?',
        'Have you had difficulties obtaining clear information about routes and schedules?',
      ];

      questions.push({
        id: `survey-${i}`,
        triggerAt,
        question: questionTexts[i % questionTexts.length],
        type: 'yes_no',
        answered: false,
      });
    }

    return questions;
  };

  const [currentProgress, setCurrentProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [surveys, setSurveys] = useState<SurveyQuestion[]>(generateSurveyQuestions());
  const [activeSurvey, setActiveSurvey] = useState<SurveyQuestion | null>(null);
  const [completedSurveys, setCompletedSurveys] = useState(0);
  const [showFinalSurvey, setShowFinalSurvey] = useState(false);
  const [finalRating, setFinalRating] = useState<number | null>(null);
  const [improvementChecked, setImprovementChecked] = useState(false);
  const [forceFirstSurvey, setForceFirstSurvey] = useState(false);
  const [selectedImprovementAreas, setSelectedImprovementAreas] = useState<string[]>([]);

  const improvementAreas = [
    { id: 'service', label: 'Service' },
    { id: 'delays', label: 'Delays' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'information', label: 'User Information' },
    { id: 'hygiene', label: 'Hygiene' },
    { id: 'comfort', label: 'Comfort' },
  ];

  // Simulate journey progress
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          // Check if user answered any surveys
          const answeredCount = surveys.filter(s => s.answered).length;
          if (answeredCount === 0) {
            // Force first survey to be answered
            setForceFirstSurvey(true);
            setActiveSurvey(surveys[0]);
          } else {
            // Show final satisfaction survey
            setShowFinalSurvey(true);
          }
          return 100;
        }
        return prev + 0.5 * speed;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, speed, surveys]);

  // Check for survey triggers
  useEffect(() => {
    const unansweredSurvey = surveys.find(
      (s) => !s.answered && currentProgress >= s.triggerAt && currentProgress < s.triggerAt + 5
    );

    if (unansweredSurvey && !activeSurvey) {
      setActiveSurvey(unansweredSurvey);
    }
  }, [currentProgress, surveys, activeSurvey]);

  const handleSurveyResponse = (answer: string | number) => {
    if (!activeSurvey) return;

    const updatedSurveys = surveys.map((s) =>
      s.id === activeSurvey.id ? { ...s, answered: true, answer } : s
    );

    setSurveys(updatedSurveys);
    setCompletedSurveys(completedSurveys + 1);
    setActiveSurvey(null);

    // If this was the forced first survey, now show final satisfaction survey
    if (forceFirstSurvey) {
      setForceFirstSurvey(false);
      setShowFinalSurvey(true);
    }
  };

  const closeSurvey = () => {
    if (activeSurvey) {
      const updatedSurveys = surveys.map((s) =>
        s.id === activeSurvey.id ? { ...s, answered: true } : s
      );
      setSurveys(updatedSurveys);
      setCompletedSurveys(completedSurveys + 1);
    }
    setActiveSurvey(null);
  };

  const handleFinalSurveySubmit = () => {
    if (finalRating !== null) {
      console.log('Final Rating:', finalRating);
      console.log('Improvement Feedback:', improvementChecked);
      console.log('Selected Improvement Areas:', selectedImprovementAreas);
      setShowFinalSurvey(false);
      setFinalRating(null);
      setImprovementChecked(false);
      setSelectedImprovementAreas([]);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const closeFinalSurvey = () => {
    setShowFinalSurvey(false);
    setFinalRating(null);
    setImprovementChecked(false);
    setSelectedImprovementAreas([]);
  };

  const toggleImprovementArea = (areaId: string) => {
    setSelectedImprovementAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  // Calculate current position between stations
  const getCurrentPosition = () => {
    const totalSegments = stations.length - 1;
    const progressPerSegment = 100 / totalSegments;
    const currentSegment = Math.floor(currentProgress / progressPerSegment);
    const segmentProgress = (currentProgress % progressPerSegment) / progressPerSegment;

    if (currentSegment >= stations.length - 1) {
      return stations[stations.length - 1].coords;
    }

    const start = stations[currentSegment].coords;
    const end = stations[currentSegment + 1].coords;

    return [
      start[0] + (end[0] - start[0]) * segmentProgress,
      start[1] + (end[1] - start[1]) * segmentProgress,
    ] as [number, number];
  };

  const currentPos = getCurrentPosition();
  const nextStationIndex = Math.ceil((currentProgress / 100) * (stations.length - 1));
  const nextStation = stations[Math.min(nextStationIndex, stations.length - 1)];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 relative">
      {/* Journey Info */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl text-gray-900 mb-4">Journey Progress</h2>

        {/* Map */}
        <div className="rounded-xl overflow-hidden shadow-lg mb-6" style={{ height: '400px' }}>
          <MapContainer
            center={[48.1848, 15.5]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Route line */}
            <Polyline
              positions={stations.map((s) => s.coords)}
              color="red"
              weight={3}
              opacity={0.7}
            />

            {/* Station markers */}
            {stations.map((station, idx) => (
              <Marker key={idx} position={station.coords}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{station.name}</p>
                    <p className="text-gray-600">{station.time}</p>
                    {station.trainType && <p className="text-xs text-gray-500">{station.trainType}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Current position marker */}
            <CircleMarker
              center={currentPos}
              radius={8}
              fill={true}
              fillColor="blue"
              fillOpacity={1}
              color="darkblue"
              weight={2}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">Current Position</p>
                  <p className="text-gray-600">Progress: {Math.round(currentProgress)}%</p>
                  <p className="text-xs">Next: {nextStation.name}</p>
                </div>
              </Popup>
            </CircleMarker>
          </MapContainer>
        </div>

        {/* Survey Chat Bubble - Positioned below map */}
        {activeSurvey && (
          <div className="mb-6 relative rounded-[40px]">
            <style>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px) scale(0.8);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              @keyframes bounce {
                0%, 100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
              .chat-bubble {
                animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
              }
              .bubble-breathing {
                animation: bounce 2s infinite;
              }
            `}</style>
            
            <div className="chat-bubble relative">
              {/* Main bubble */}
              <div className="bg-white rounded-[40px] shadow-2xl p-8 relative border-2 border-red-100 bg-gradient-to-br from-white via-red-50 to-white overflow-hidden">
                {/* Close button - Hidden if this is forced first survey */}
                {!forceFirstSurvey && (
                  <button
                    onClick={closeSurvey}
                    className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-full transition-all transform hover:scale-110 shadow-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Header with animation */}
                <div className="mb-6">
                  <h3 className="text-lg text-gray-900 font-bold">Experience Survey</h3>
                  <p className="text-xs text-gray-400 mt-1">Your feedback matters to us</p>
                </div>

                {/* Question with gradient text */}
                <p className="text-lg text-gray-900 mb-6 font-semibold leading-relaxed">
                  {activeSurvey.question}
                </p>

                <div className="space-y-4">
                  {activeSurvey.type === 'rating' && (
                    <div className="flex gap-3 justify-center">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleSurveyResponse(rating)}
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 text-red-700 font-bold text-lg hover:from-red-500 hover:to-red-600 hover:text-white transition-all transform hover:scale-125 shadow-lg hover:shadow-xl active:scale-95"
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeSurvey.type === 'yes_no' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSurveyResponse('yes')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 font-semibold"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        Yes
                      </button>
                      <button
                        onClick={() => handleSurveyResponse('no')}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 font-semibold"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        No
                      </button>
                    </div>
                  )}

                  {activeSurvey.type === 'text' && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Your answer..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            handleSurveyResponse(e.currentTarget.value);
                          }
                        }}
                        className="flex-1 p-3 bg-gray-50 border-2 border-red-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-700 font-medium"
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          if (input.value) {
                            handleSurveyResponse(input.value);
                          }
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95 font-semibold"
                      >
                        OK
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer with progress */}
                <div className="mt-6 pt-4 border-t-2 border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Progress</p>
                    <p className="text-sm text-red-600 font-bold">{completedSurveys}/{surveys.length}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${(completedSurveys / surveys.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bottom bubble tail */}
                <div className="absolute -bottom-3 left-12 w-4 h-4 bg-white rounded-full shadow-md border-2 border-red-100"></div>
              </div>
            </div>
          </div>
        )}

        {/* Final Satisfaction Survey - Same format as other surveys */}
        {showFinalSurvey && (
          <div className="mb-6 relative rounded-[40px]">
            <style>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px) scale(0.8);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              .final-chat-bubble {
                animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
              }
            `}</style>
            
            <div className="final-chat-bubble relative">
              {/* Main bubble */}
              <div className="bg-white rounded-[40px] shadow-2xl p-8 relative border-2 border-red-100 bg-gradient-to-br from-white via-red-50 to-white overflow-hidden">
                {/* No close button - Survey is mandatory */}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-lg text-gray-900 font-bold">Service Satisfaction</h3>
                  <p className="text-xs text-gray-400 mt-1">How was your overall experience?</p>
                </div>

                {/* Question */}
                <p className="text-lg text-gray-900 mb-6 font-semibold leading-relaxed">
                  How satisfied are you with your travel experience?
                </p>

                {/* Rating Scale */}
                <div className="mb-6">
                  <div className="flex gap-3 justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFinalRating(rating)}
                        className={`w-14 h-14 rounded-full font-bold text-lg transition-all transform hover:scale-125 shadow-lg hover:shadow-xl active:scale-95 ${
                          finalRating === rating
                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                            : 'bg-gradient-to-br from-red-100 to-red-200 text-red-700 hover:from-red-500 hover:to-red-600 hover:text-white'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 px-2">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Improvement Checkbox */}
                <div className="mb-6 p-3 bg-amber-50 rounded-2xl border-2 border-amber-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={improvementChecked}
                      onChange={(e) => setImprovementChecked(e.target.checked)}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium text-sm">There is room for improvement</span>
                  </label>
                </div>

                {/* Improvement Areas - Show when checkbox is checked */}
                {improvementChecked && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Which areas can we improve?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {improvementAreas.map((area) => (
                        <label
                          key={area.id}
                          className="flex items-center gap-2 p-2 cursor-pointer hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedImprovementAreas.includes(area.id)}
                            onChange={() => toggleImprovementArea(area.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 font-medium">{area.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleFinalSurveySubmit}
                  disabled={finalRating === null || (improvementChecked && selectedImprovementAreas.length === 0)}
                  className={`w-full py-3 rounded-2xl font-bold transition-all transform ${
                    finalRating !== null && (!improvementChecked || selectedImprovementAreas.length > 0)
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit
                </button>

                {/* Bottom bubble tail */}
                <div className="absolute -bottom-3 left-12 w-4 h-4 bg-white rounded-full shadow-md border-2 border-red-100"></div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Current Station</p>
            <p className="text-lg text-gray-900 font-bold">
              {stations[Math.min(Math.floor((currentProgress / 100) * stations.length), stations.length - 1)].name}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Next Stop</p>
            <p className="text-lg text-gray-900 font-bold">{nextStation.name}</p>
            <p className="text-xs text-gray-500">Arrival: {nextStation.time}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Journey Progress</p>
            <p className="text-sm text-red-600 font-bold">{Math.round(currentProgress)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Survey Progress */}
        <div className="mb-6 p-4 bg-purple-50 rounded-xl">
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${(completedSurveys / surveys.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause Journey' : 'Start Journey'}
            </button>
            <button
              onClick={() => {
                setCurrentProgress(0);
                setIsPlaying(false);
              }}
              className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>

          {/* Speed Control */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Speed: {speed}x</p>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>1.5x</span>
              <span>3x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Station Timeline */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg text-gray-900 mb-4">Station Schedule</h3>
        <div className="space-y-3">
          {stations.map((station, idx) => {
            const stationProgress = (idx / (stations.length - 1)) * 100;
            const isCompleted = currentProgress >= stationProgress;
            const isCurrentOrNext = Math.abs(currentProgress - stationProgress) < 20;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                  isCurrentOrNext
                    ? 'bg-red-50 border-2 border-red-300'
                    : isCompleted
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      isCurrentOrNext
                        ? 'bg-red-600'
                        : isCompleted
                        ? 'bg-green-600'
                        : 'bg-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">{station.name}</p>
                    <p className="text-sm text-gray-500">{station.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {isCompleted ? '✓ Completed' : isCurrentOrNext ? '▶ Current' : 'Upcoming'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
