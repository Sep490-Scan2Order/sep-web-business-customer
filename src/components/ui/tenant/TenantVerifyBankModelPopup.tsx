"use client"
import { API, BANK_API } from '@/src/constants/api';
import apiClient from '@/src/services/apiClient';
import { useAuth } from '@/src/hooks/useAuth';
import { BankInfo, UserInfo } from '@/src/types/type';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { Search, X, Check, BookOpen, Link2, Settings2Icon } from 'lucide-react';

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
  const { refreshUserInfo, user } = useAuth();
  const userInfo = (user ?? null) as UserInfo | null;
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
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
          console.error('Không thể tải danh sách ngân hàng:', response.data?.message || 'Lỗi không xác định');
          toast.error('Không thể tải thông tin ngân hàng. Vui lòng thử lại sau.');
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin ngân hàng:', error);
        toast.error('Lỗi khi tải thông tin ngân hàng');
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
    setPaymentCode(null);
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

      const lookupResult = bankNameResponse.data?.data as Record<string, unknown>;
      const isLookupSuccess = lookupResult?.success || lookupResult?.Success;
      const lookupMsg = (lookupResult?.msg as string) || (lookupResult?.Msg as string);
      
      if (!bankNameResponse.data?.isSuccess || !isLookupSuccess) {
        toast.error(lookupMsg || 'Thông tin tài khoản ngân hàng không hợp lệ');
        return;
      }

      const updateUrl = `${API.TENANT.UPDATE_BANK_INFO}${formData.bankId}&accountNumber=${formData.cardNumber}`;
      const updateResponse = await apiClient.put(updateUrl);
      
      if (updateResponse.data?.isSuccess) {
        // Handle both old backend response (string) and new backend response (object)
        let newQrUrl: string | null = null;
        let newPaymentCode: string | null = null;

        if (typeof updateResponse.data.data === 'string') {
          newQrUrl = updateResponse.data.data;
          // Try to extract paymentCode from the URL if it's the old response format
          try {
            const urlObj = new URL(newQrUrl as string);
            newPaymentCode = urlObj.searchParams.get('des');
          } catch (e) {
            console.error("Could not parse QR URL");
          }
        } else {
          const responseData = updateResponse.data.data as Record<string, unknown>;
          newQrUrl = (responseData?.qrUrl as string) || (responseData?.QrUrl as string) || null;
          newPaymentCode = (responseData?.paymentCode as string) || (responseData?.PaymentCode as string) || null;
        }
        
        setQrUrl(newQrUrl);
        setPaymentCode(newPaymentCode);
        await refreshUserInfo();
        onSubmit({ ...formData, bank: selectedBank });
      } else {
        toast.error(updateResponse.data?.message || 'Cập nhật thông tin ngân hàng thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi xác thực thông tin ngân hàng:', error);
      const backendMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(backendMessage || 'Lỗi khi xác thực thông tin ngân hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Xác thực tài khoản ngân hàng</h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
              <a
                href="/sepay-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Hướng dẫn liên kết SePay
              </a>
              <a
                href="/webhook-guide"
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <Link2 className="h-3.5 w-3.5" />
                Cách dùng webhook
              </a>
              <a
                href="/config-guide"
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <Settings2Icon className="h-3.5 w-3.5" />
                Hướng dẫn cấu hình
              </a>

            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!qrUrl && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold mb-2">⚠️ Lưu ý quy tắc đối soát chéo:</p>
              <div className="mb-2 p-2 bg-white rounded-lg border border-amber-100">
                <p className="text-xs text-amber-600 mb-1">Thông tin ĐKKD hiện tại:</p>
                <p className="font-medium text-slate-900">Mã số thuế: {userInfo?.taxNumber || 'Chưa cập nhật'}</p>
                <p className="font-medium text-slate-900">Đại diện pháp luật: <span className="text-emerald-700">{userInfo?.name || 'Chưa cập nhật'}</span></p>
              </div>
              <p>
                Tên chủ tài khoản ngân hàng phải <strong>trùng khớp hoàn toàn</strong> với Tên đại diện pháp luật <strong>({userInfo?.name || 'Chưa có'})</strong> trên Cục Thuế. 
                Hệ thống sẽ tự động xác thực cả Ngân Hàng và Thuế nếu thông tin khớp nhau.
              </p>
              <p className="mt-2 text-amber-700 text-xs">
                <em>Lưu ý: Nếu không khớp (ví dụ do viết tắt), hệ thống sẽ chỉ xác thực phần Ngân hàng. Trong trường hợp này, vui lòng liên hệ đội ngũ Admin/Support để được duyệt phần Thuế thủ công.</em>
              </p>
            </div>
          )}

          {qrUrl ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700">QR xác thực ngân hàng</p>
                <p className="mt-2 text-sm text-emerald-700">Quét mã để tự động điền nội dung chuyển khoản</p>
              </div>
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Mã QR xác thực" className="h-56 w-56 object-contain" />
              </div>
              
              {paymentCode && (
                <div className="text-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-600 mb-1">Mã nội dung chuyển khoản:</p>
                  <p className="text-lg font-bold text-slate-900 tracking-wider">{paymentCode}</p>
                </div>
              )}
              
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 text-center">
                <p className="font-medium">Vui lòng chuyển đúng <strong>10.000 VND</strong> theo nội dung trên. Trạng thái sẽ được đồng bộ ngay lập tức!</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Xong, tôi đã chuyển khoản
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
