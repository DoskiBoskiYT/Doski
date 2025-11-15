import React, { useEffect, useRef, useCallback } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature } from 'geojson';
import { select } from 'd3-selection';
import { zoom, D3ZoomEvent } from 'd3-zoom';

interface WorldMapProps {
  onCountryClick: (countryName: string, countryId: string) => void;
  selectedCountryId: string | null;
  geographies: Feature[];
  isInteractive: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ onCountryClick, selectedCountryId, geographies, isInteractive }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  const projection = geoMercator().scale(140).translate([800 / 2, 450 / 2 + 50]);
  const pathGenerator = geoPath().projection(projection);

  const handleZoom = useCallback((event: D3ZoomEvent<SVGSVGElement, unknown>) => {
    if (gRef.current) {
        select(gRef.current).attr('transform', event.transform.toString());
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 10])
      .translateExtent([[-100, -100], [900, 600]])
      .on('zoom', handleZoom);
    
    svg.call(zoomBehavior);

    return () => {
        svg.on('.zoom', null);
    };
  }, [handleZoom]);

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 flex items-center justify-center">
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
        <g ref={gRef}>
          {geographies.map((geo) => {
            const countryName = (geo.properties as { name: string }).name;
            const countryId = geo.id as string;
            const isSelected = selectedCountryId === countryId;

            const hoverClass = isInteractive ? 'hover:fill-cyan-500' : '';
            const cursorClass = isInteractive ? 'cursor-pointer' : 'cursor-default';

            return (
              <path
                key={geo.id || countryName}
                d={pathGenerator(geo) || ''}
                className={`
                  stroke-gray-700 stroke-[0.5] transition-all duration-200 ease-in-out
                  ${cursorClass}
                  ${isSelected ? 'fill-cyan-400' : `fill-gray-600 ${hoverClass}`}
                `}
                onClick={() => isInteractive && onCountryClick(countryName, countryId)}
              >
                <title>{countryName}</title>
              </path>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default WorldMap;
