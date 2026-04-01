import type { Occasion, LocationType, RecommendationRequest, Season, TimeOfDay, Weather } from '../types/api'

interface Props {
  value: Partial<RecommendationRequest>
  onChange: (next: Partial<RecommendationRequest>) => void
  onSubmit: () => void
  loading: boolean
}

function ButtonGroup<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T | undefined
  onSelect: (v: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              value === opt.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const seasons: { value: Season; label: string }[] = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
]

const occasions: { value: Occasion; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'office', label: 'Office' },
  { value: 'date', label: 'Date' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'formal', label: 'Formal' },
  { value: 'party', label: 'Party' },
]

const timesOfDay: { value: TimeOfDay; label: string }[] = [
  { value: 'early_morning', label: 'Early Morning' },
  { value: 'day', label: 'Day' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
]

const weathers: { value: Weather; label: string }[] = [
  { value: 'hot', label: 'Hot' },
  { value: 'mild', label: 'Mild' },
  { value: 'cold', label: 'Cold' },
  { value: 'rainy', label: 'Rainy' },
]

const locationTypes: { value: LocationType; label: string }[] = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
]

function isComplete(v: Partial<RecommendationRequest>): v is RecommendationRequest {
  return !!(v.season && v.occasion && v.time_of_day && v.weather && v.location_type)
}

export default function ContextForm({ value, onChange, onSubmit, loading }: Props) {
  const complete = isComplete(value)

  return (
    <div className="space-y-5">
      <ButtonGroup
        label="Season"
        options={seasons}
        value={value.season}
        onSelect={(v) => onChange({ ...value, season: v })}
      />
      <ButtonGroup
        label="Occasion"
        options={occasions}
        value={value.occasion}
        onSelect={(v) => onChange({ ...value, occasion: v })}
      />
      <ButtonGroup
        label="Time of Day"
        options={timesOfDay}
        value={value.time_of_day}
        onSelect={(v) => onChange({ ...value, time_of_day: v })}
      />
      <ButtonGroup
        label="Weather"
        options={weathers}
        value={value.weather}
        onSelect={(v) => onChange({ ...value, weather: v })}
      />
      <ButtonGroup
        label="Location"
        options={locationTypes}
        value={value.location_type}
        onSelect={(v) => onChange({ ...value, location_type: v })}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!complete || loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
      >
        {loading ? 'Finding…' : 'Get Recommendation'}
      </button>
    </div>
  )
}
