interface MetricCardProps {
  label: string;
  value: string;
}

const MetricCard = ({ label, value }: MetricCardProps) => (
  <div className="rounded-[10px] flex flex-col items-start border border-[#DFDFDF]  max-w-[210px] font-geist-sans bg-white py-5 px-[40px]">
    <div className="text-base text-black w-fit">{label}</div>
    <div className="mt-1 text-xl font-semibold text-black w-fit">{value}</div>
  </div>
);

export default MetricCard;
