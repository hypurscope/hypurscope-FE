interface MetricCardProps {
  label: string;
  value: string;
  fontSize?: string;
}

const MetricCard = ({ label, value, fontSize }: MetricCardProps) => (
<div className="rounded-[10px] flex flex-col items-start   min-w-[200px] border border-[#DFDFDF] font-geist-sans bg-white py-5 px-[40px] w-fit">
  <div className={`text-base text-black w-fit whitespace-nowrap`}>{label}</div>
  <div className={`mt-1  font-semibold text-black w-fit whitespace-nowrap ${fontSize ? fontSize : "text-xl"}`}>{value}</div>
</div>
);

export default MetricCard;
