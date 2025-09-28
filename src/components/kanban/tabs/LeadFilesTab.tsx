import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import {
  FileText,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  User,
  Calendar,
  HardDrive,
  File,
  FileSpreadsheet,
  FileImage,
  FileCode
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { LeadFile } from '../../../types/leadModal';
import { formatDate, formatFileSize } from '../../../utils/helpers';

interface LeadFilesTabProps {
  leadId: string;
  initialFiles: LeadFile[];
}

export const LeadFilesTab: React.FC<LeadFilesTabProps> = ({
  leadId,
  initialFiles
}) => {
  const [files, setFiles] = useState<LeadFile[]>(initialFiles);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = (fileType: string, mimeType: string) => {
    switch (fileType) {
      case 'image':
        return FileImage;
      case 'pdf':
        return FileText;
      case 'spreadsheet':
        return FileSpreadsheet;
      case 'document':
        return FileText;
      case 'presentation':
        return FileText;
      default:
        if (mimeType?.startsWith('text/')) {
          return FileCode;
        }
        return File;
    }
  };

  const getFileColor = (fileType: string) => {
    const colors = {
      image: 'text-green-600 dark:text-green-400',
      pdf: 'text-red-600 dark:text-red-400',
      document: 'text-blue-600 dark:text-blue-400',
      spreadsheet: 'text-green-600 dark:text-green-400',
      presentation: 'text-orange-600 dark:text-orange-400',
      text: 'text-muted-foreground',
      other: 'text-muted-foreground'
    };
    return colors[fileType as keyof typeof colors] || colors.other;
  };

  const getVirusScanColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      clean: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      infected: 'bg-destructive/10 text-destructive',
      error: 'bg-muted text-muted-foreground'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getVirusScanIcon = (status: string) => {
    switch (status) {
      case 'clean':
        return CheckCircle;
      case 'infected':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getVirusScanLabel = (status: string) => {
    const labels = {
      pending: 'Analisando',
      clean: 'Seguro',
      infected: 'Ameaça',
      error: 'Erro'
    };
    return labels[status as keyof typeof labels] || 'Desconhecido';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simular upload com progresso
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Aqui você implementaria o upload real
      // const formData = new FormData();
      // formData.append('file', selectedFiles[0]);
      // const response = await leadModalService.uploadFile(leadId, formData);

      // Simular arquivo adicionado
      const mockFile: LeadFile = {
        id: Date.now().toString(),
        lead_id: leadId,
        original_filename: selectedFiles[0].name,
        stored_filename: selectedFiles[0].name,
        file_path: '/mock/path',
        file_size: selectedFiles[0].size,
        file_type: 'document',
        mime_type: selectedFiles[0].type,
        virus_scan_status: 'clean',
        virus_scan_result: undefined,
        is_public: false,
        download_count: 0,
        tags: [],
        description: null,
        uploadedBy: {
          id: '1',
          name: 'Usuário Atual'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setFiles(prev => [...prev, mockFile]);
    } catch (err: any) {
      console.error('Erro ao fazer upload:', err);
      setError('Erro ao fazer upload do arquivo');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const handleDownload = (file: LeadFile) => {
    console.log('Download file:', file.id);
    // Implementar download real aqui
  };

  const canDownload = (file: LeadFile) => {
    return file.virus_scan_status === 'clean';
  };

  // Agrupar arquivos por tipo
  const groupedFiles = files.reduce((groups, file) => {
    if (!groups[file.file_type]) {
      groups[file.file_type] = [];
    }
    groups[file.file_type].push(file);
    return groups;
  }, {} as Record<string, LeadFile[]>);

  const fileTypeLabels = {
    image: 'Imagens',
    document: 'Documentos',
    pdf: 'PDFs',
    spreadsheet: 'Planilhas',
    presentation: 'Apresentações',
    text: 'Textos',
    other: 'Outros'
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Arquivos</h3>
          <div className="flex gap-2">
            <label htmlFor="file-upload">
              <Button asChild className="flex items-center gap-2" size="sm">
                <span>
                  <Upload className="h-4 w-4" />
                  Upload
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {isLoading && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">
                Fazendo upload... {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-destructive">{error}</div>
        )}
      </div>

      {/* Files List */}
      <div className="p-4">
        {Object.entries(groupedFiles).map(([type, typeFiles]) => {
          const Icon = getFileIcon(type, '');

          return (
            <div key={type} className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn('h-5 w-5', getFileColor(type))} />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {fileTypeLabels[type as keyof typeof fileTypeLabels] || type}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {typeFiles.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {typeFiles.map(file => {
                  const FileIcon = getFileIcon(file.file_type, file.mime_type);
                  const VirusScanIcon = getVirusScanIcon(file.virus_scan_status);

                  return (
                    <Card key={file.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <FileIcon className={cn('h-7 w-7 flex-shrink-0', getFileColor(file.file_type))} />

                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
                              {file.original_filename}
                            </h5>

                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="secondary"
                                className={cn('text-xs', getVirusScanColor(file.virus_scan_status))}
                              >
                                <VirusScanIcon className="h-3 w-3 mr-1" />
                                {getVirusScanLabel(file.virus_scan_status)}
                              </Badge>

                              {file.is_public && (
                                <Badge variant="outline" className="text-xs">
                                  Público
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <HardDrive className="h-3 w-3" />
                                <span>{formatFileSize(file.file_size)}</span>
                              </div>

                              {file.uploadedBy && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{file.uploadedBy.name}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(file.created_at)}</span>
                              </div>

                              {file.download_count > 0 && (
                                <div className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  <span>{file.download_count} downloads</span>
                                </div>
                              )}
                            </div>

                            {file.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                {file.description}
                              </p>
                            )}

                            {file.tags && file.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {file.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 mt-2 pt-2 border-t">
                          {canDownload(file) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(file)}
                              className="h-8 flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              <span className="text-xs">Baixar</span>
                            </Button>
                          )}

                          {file.file_type === 'image' && canDownload(file) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span className="text-xs">Visualizar</span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {files.length === 0 && (
          <div className="text-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum arquivo ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Faça upload de documentos, imagens e outros arquivos relacionados ao lead
            </p>
            <label htmlFor="file-upload-empty">
              <Button asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </span>
              </Button>
            </label>
            <input
              id="file-upload-empty"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
            />
          </div>
        )}
      </div>
    </div>
  );
};