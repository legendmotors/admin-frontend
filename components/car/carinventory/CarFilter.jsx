'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Select from 'react-select';

const mockCars = [
  { id: 1, brand: 'toyota', model: 'corolla', trim: 'LE', year: '2024', price: 30000 },
  { id: 2, brand: 'toyota', model: 'corolla', trim: 'XLE', year: '2023', price: 32000 },
  { id: 3, brand: 'toyota', model: 'camry', trim: 'SE', year: '2022', price: 35000 },
  { id: 4, brand: 'toyota', model: 'rav4', trim: 'XSE', year: '2024', price: 40000 },
  { id: 5, brand: 'honda', model: 'civic', trim: 'Sport', year: '2024', price: 28000 },
  { id: 6, brand: 'honda', model: 'accord', trim: 'EX', year: '2023', price: 32000 },
  { id: 7, brand: 'bmw', model: 'x5', trim: 'M Sport', year: '2024', price: 60000 },
  { id: 8, brand: 'bmw', model: 'x3', trim: 'Luxury', year: '2022', price: 55000 },
];

export default function CarFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filteredCars, setFilteredCars] = useState(mockCars);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedTrims, setSelectedTrims] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [priceRange, setPriceRange] = useState(50000);

  const filterCars = () => {
    return mockCars.filter(car =>
      (!selectedBrands.length || selectedBrands.some(b => b.value === car.brand)) &&
      (!selectedModels.length || selectedModels.some(m => m.value === car.model)) &&
      (!selectedTrims.length || selectedTrims.some(t => t.value === car.trim)) &&
      (!selectedYear || car.year.toString() === selectedYear) &&
      (car.price <= priceRange)
    );
  };

  const availableBrands = useMemo(() => {
    const filtered = filterCars();
    return [...new Set(filtered.map(car => car.brand))].map(brand => ({ value: brand, label: brand.toUpperCase() }));
  }, [selectedYear, priceRange]);

  const availableModels = useMemo(() => {
    const filtered = filterCars();
    return [...new Set(filtered.map(car => car.model))].map(model => ({ value: model, label: model.toUpperCase() }));
  }, [selectedBrands, selectedYear, priceRange]);

  const availableTrims = useMemo(() => {
    const filtered = filterCars();
    return [...new Set(filtered.map(car => car.trim))].map(trim => ({ value: trim, label: trim.toUpperCase() }));
  }, [selectedModels, selectedYear, priceRange]);

  const availableYears = useMemo(() => {
    const filtered = filterCars();
    return [...new Set(filtered.map(car => car.year))].map(year => ({ value: year.toString(), label: year.toString() }));
  }, [selectedBrands, selectedModels, selectedTrims, priceRange]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBrands.length) params.set('brands', selectedBrands.map(b => b.value).join(','));
    if (selectedModels.length) params.set('models', selectedModels.map(m => m.value).join(','));
    if (selectedTrims.length) params.set('trims', selectedTrims.map(t => t.value).join(','));
    if (selectedYear) params.set('year', selectedYear);
    if (priceRange) params.set('price', priceRange);
    router.replace(`?${params.toString()}`);
  }, [selectedBrands, selectedModels, selectedTrims, selectedYear, priceRange]);

  useEffect(() => {
    setFilteredCars(filterCars());
  }, [selectedBrands, selectedModels, selectedTrims, selectedYear, priceRange]);

  const renderSelect = (options, value, onChange, placeholder, isDisabled = false) => (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isMulti
      isDisabled={isDisabled}
      className="mb-4"
    />
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-4">Filter Cars</h2>
      {renderSelect(availableBrands, selectedBrands, setSelectedBrands, "Select Brand(s)")}
      {renderSelect(availableModels, selectedModels, setSelectedModels, "Select Model(s)", selectedBrands.length === 0)}
      {renderSelect(availableTrims, selectedTrims, setSelectedTrims, "Select Trim(s)", selectedModels.length === 0)}
      {renderSelect(availableYears, availableYears.find(y => y.value === selectedYear), setSelectedYear, "Select Year")}

      <input
        type="range"
        min="10000"
        max="100000"
        step="5000"
        value={priceRange}
        onChange={(e) => setPriceRange(e.target.value)}
        className="w-full mb-2"
      />
      <p className="text-gray-700 text-sm mb-4">Max Price: AED {priceRange}</p>

      <h3 className="text-lg font-semibold mt-6 mb-2">Filtered Cars</h3>
      <ul className="list-disc pl-5">
        {filteredCars.length > 0 ? (
          filteredCars.map(car => (
            <li key={car.id} className="text-gray-800">
              {car.brand} {car.model} {car.trim} ({car.year}) - AED {car.price}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No cars match your criteria.</p>
        )}
      </ul>
    </div>
  );
}