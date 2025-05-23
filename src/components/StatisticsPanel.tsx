import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Activity } from 'lucide-react';

export const StatisticsPanel: React.FC = () => {
  const { detectionResults, isDetecting } = useAppContext();
  
  const stats = useMemo(() => {
    const classCount: Record<string, number> = {};
    let totalConfidence = 0;
    let totalObjects = 0;
    
    detectionResults.forEach(result => {
      classCount[result.class] = (classCount[result.class] || 0) + 1;
      totalConfidence += result.confidence;
      totalObjects += 1;
    });
    
    const avgConfidence = totalObjects > 0 ? totalConfidence / totalObjects : 0;
    
    return {
      objectCount: totalObjects,
      classCounts: Object.entries(classCount).sort((a, b) => b[1] - a[1]),
      avgConfidence
    };
  }, [detectionResults]);

  if (!isDetecting && detectionResults.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center mb-4">
          <BarChart className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold">Detection Statistics</h3>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Start detection to see statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center mb-4">
        <BarChart className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold">Detection Statistics</h3>
      </div>
      
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">Objects Detected</p>
            <p className="text-2xl font-bold">{stats.objectCount}</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">Avg. Confidence</p>
            <p className="text-2xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-gray-300 mb-2">Detected Classes</h4>
      <div className="space-y-2">
        {stats.classCounts.length > 0 ? (
          stats.classCounts.map(([className, count]) => (
            <div key={className} className="bg-gray-700 rounded-lg p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="capitalize text-sm">{className}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${getColorForClass(className)}`}
                  style={{ width: `${Math.min(100, (count / stats.objectCount) * 100)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-2">No objects detected</p>
        )}
      </div>
    </div>
  );
};

const getColorForClass = (className: string): string => {
  const colorMap: Record<string, string> = {
    person: 'bg-red-500',
    car: 'bg-blue-500',
    truck: 'bg-indigo-500',
    motorcycle: 'bg-green-500',
    bicycle: 'bg-purple-500',
    bus: 'bg-orange-500',
    default: 'bg-blue-500'
  };
  
  return colorMap[className] || colorMap.default;
};