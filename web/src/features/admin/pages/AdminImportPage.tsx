import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { DownloadCloud, Sparkles } from 'lucide-react';

export const AdminImportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Cào Dữ liệu Tự động (OpenStreetMap)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tự động đồng bộ và làm giàu dữ liệu địa điểm du lịch từ OpenStreetMap theo thành phố
        </p>
      </div>

      <Card className="p-6 max-w-xl space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-borderGray">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-oceanBlue flex items-center justify-center font-bold">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Import từ OpenStreetMap (OSM)</h3>
            <p className="text-xs text-slate-500">API: POST /api/admin/import/osm</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn Thành phố cần cào dữ liệu
            </label>
            <select className="w-full rounded-xl border border-borderGray bg-surfaceWhite px-3.5 py-2.5 text-xs text-slate-900 outline-none">
              <option value="">-- Chọn thành phố (GET /api/admin/import/vietnam-cities) --</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giới hạn số lượng (limit mỗi loại: attraction, hotel, restaurant, cafe)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="w-full rounded-xl border border-borderGray bg-surfaceWhite px-3.5 py-2.5 text-xs text-slate-900 outline-none"
            />
          </div>

          <Button variant="primary" className="w-full mt-2" leftIcon={<Sparkles className="w-4 h-4" />}>
            Bắt đầu cào dữ liệu
          </Button>
        </div>
      </Card>
    </div>
  );
};
