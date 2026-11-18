import React from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { DownloadCloud, Sparkles } from 'lucide-react';
import './css/AdminPages.css';

export const AdminImportPage: React.FC = () => {
  useDocumentTitle('Cào dữ liệu OSM');
  return (
    <div className="admin-page">
      <div>
        <h1 className="admin-page__title">Cào Dữ liệu Tự động (OpenStreetMap)</h1>
        <p className="admin-page__subtitle">
          Tự động đồng bộ và làm giàu dữ liệu địa điểm du lịch từ OpenStreetMap theo thành phố
        </p>
      </div>

      <Card className="admin-import-card">
        <div className="admin-import-header">
          <div className="admin-stat-card__icon admin-stat-card__icon--blue">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900" style={{ margin: 0 }}>Import từ OpenStreetMap (OSM)</h3>
            <p className="text-xs text-slate-500" style={{ margin: '0.25rem 0 0 0' }}>API: POST /api/admin/import/osm</p>
          </div>
        </div>

        <div className="admin-import-body">
          <div>
            <label className="admin-label">
              Chọn Thành phố cần cào dữ liệu
            </label>
            <select className="admin-select">
              <option value="">-- Chọn thành phố (GET /api/admin/import/vietnam-cities) --</option>
            </select>
          </div>

          <div>
            <label className="admin-label">
              Giới hạn số lượng (limit mỗi loại: attraction, hotel, restaurant, cafe)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="admin-number-input"
            />
          </div>

          <Button variant="primary" className="w-full" style={{ marginTop: '0.5rem' }} leftIcon={<Sparkles className="w-4 h-4" />}>
            Bắt đầu cào dữ liệu
          </Button>
        </div>
      </Card>
    </div>
  );
};
