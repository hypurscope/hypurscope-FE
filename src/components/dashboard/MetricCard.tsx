interface MetricCardProps {
  label: string;
  value: string;
  fontSize?: string;
  className?: string;
  loading?: boolean; // show skeleton instead of value
  valuePlaceholderWidth?: string; // custom skeleton width
}

const MetricCard = ({
  label,
  value,
  fontSize,
  className = "",
  loading = false,
  valuePlaceholderWidth = "w-16",
}: MetricCardProps) => {
  return (
    <div
      className={`rounded-[10px] flex flex-col items-start min-w-[140px] sm:min-w-[170px] md:min-w-[200px] w-full md:w-fit border border-[#DFDFDF] font-geist-sans bg-white py-4 md:py-5 px-4 md:px-[40px] ${className}`}
    >
      <div className="text-sm md:text-base text-black w-fit whitespace-nowrap">
        {label}
      </div>
      {loading ? (
        <div
          className={`mt-2 h-5 md:h-6 rounded bg-gray-200 animate-pulse ${valuePlaceholderWidth}`}
        />
      ) : (
        <div
          className={`mt-1 font-semibold text-black w-fit whitespace-nowrap ${
            fontSize ? fontSize : "text-lg md:text-xl"
          }`}
        >
          {value}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
