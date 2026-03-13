"use client"
import { API, BANK_API } from '@/src/constants/api';
import apiClient from '@/src/services/apiClient';
import { useAuth } from '@/src/hooks/useAuth';
import { BankInfo } from '@/src/types/type';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { Search, X, Check } from 'lucide-react';

interface BankVerifyFormData {
  cardNumber: string;
  bankId: string;
  bankCode?: string;
}

interface TenantVerifyBankModelPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BankVerifyFormData & { bank: BankInfo }) => void;
  isLoading?: boolean;
}

export default function TenantVerifyBankModelPopup({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: TenantVerifyBankModelPopupProps) {
  const { refreshUserInfo } = useAuth();
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrMessage, setQrMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<BankVerifyFormData>({
    cardNumber: '',
    bankId: '',
    bankCode: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchBankInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(BANK_API.GET_ALL);
        if (response.data?.data) {
          const bankList = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
          setBanks(bankList);
        } else {
          console.error('Failed to fetch bank info:', response.data?.message || 'Unknown error');
          toast.error('Failed to fetch bank information. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching bank info:', error);
        toast.error('Error fetching bank information');
      } finally {
        setLoading(false);
      }
    };

    fetchBankInfo();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    setSelectedBank(null);
    setSearchQuery('');
    setFormData({ cardNumber: '', bankId: '' });
    setQrUrl(null);
    setQrMessage(null);
    setIsSubmitting(false);
  }, [isOpen]);

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBank = (bank: BankInfo) => {
    setSelectedBank(bank);
    setFormData((prev) => ({
      ...prev,
      bankId: bank.id,
      bankCode: bank.code,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) {
      toast.error('Vui lòng chọn ngân hàng');
      return;
    }
    if (!formData.cardNumber.trim()) {
      toast.error('Vui lòng nhập số thẻ');
      return;
    }
    try {
      setIsSubmitting(true);
      const bankNameResponse = await apiClient.post(API.TENANT.SEARCH_BANK_NAME_BY_CARD_NUMBER, {
          bank: formData.bankCode,
          account: formData.cardNumber,
      });

      const lookupResult = bankNameResponse.data?.data;
      if (!bankNameResponse.data?.isSuccess || !lookupResult?.success) {
        toast.error(lookupResult?.msg || 'Thông tin tài khoản ngân hàng không hợp lệ');
        return;
      }

      const updateUrl = `${API.TENANT.UPDATE_BANK_INFO}${formData.bankId}&accountNumber=${formData.cardNumber}`;
      const updateResponse = await apiClient.put(updateUrl);
      if (updateResponse.data?.isSuccess) {
        setQrUrl(updateResponse.data?.data || null);
        setQrMessage(updateResponse.data?.message || null);
        await refreshUserInfo();
        onSubmit({ ...formData, bank: selectedBank });
      } else {
        toast.error(updateResponse.data?.message || 'Cập nhật thông tin ngân hàng thất bại');
      }
    } catch (error) {
      console.error('Error verifying bank info:', error);
      const backendMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(backendMessage || 'Error verifying bank information');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 z-10">
          <h2 className="text-lg font-semibold text-slate-900">Xác thực tài khoản ngân hàng</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {qrUrl ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700">QR xác thực ngân hàng</p>
                <p className="mt-2 text-sm text-emerald-700">Quét mã để hoàn tất xác thực</p>
              </div>
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR code" className="h-56 w-56 object-contain" />
              </div>
              {qrMessage ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {qrMessage}
                </div>
              ) : null}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Vui lòng chuyển đúng 10.000 VND theo QR. Sau khi giao dịch được xác nhận, trạng thái sẽ đồng bộ tự động.
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : !selectedBank ? (
            // Bank Selection View
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ngân hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredBanks.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {filteredBanks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => handleSelectBank(bank)}
                          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50"
                        >
                          {bank.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={bank.logo_url}
                              alt={bank.name}
                              className="h-12 w-12 object-contain"
                            />
                          )}
                          <div className="text-center">
                            <p className="line-clamp-2 text-xs font-medium text-slate-900">{bank.name}</p>
                            <p className="text-xs text-slate-500">{bank.code}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                      <p className="text-sm text-slate-500">Không tìm thấy ngân hàng</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Bank Info Form View
            <div className="space-y-6">
              {/* Selected Bank Info */}
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                {selectedBank.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedBank.logo_url}
                    alt={selectedBank.name}
                    className="h-12 w-12 object-contain"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{selectedBank.name}</p>
                  <p className="text-xs text-slate-500">{selectedBank.code}</p>
                </div>
                <Check className="h-5 w-5 text-emerald-600" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Số thẻ/Tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="9704 XXXX XXXX 9999"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBank(null);
                      setFormData({ cardNumber: '', bankId: '' });
                    }}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isLoading || isSubmitting ? 'Đang xử lý...' : 'Xác thực'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
