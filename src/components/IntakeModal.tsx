import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Check,
  FileText,
  Mail,
  User,
  Phone,
  Building,
  Target,
  DollarSign,
  Calendar,
  AlertTriangle,
  Sparkles,
  Trash2,
  FileImage
} from 'lucide-react';
import { OilgateFullLogo } from './OilgateLogos';
import { IntakeFormData, BuildType, MainGoal, BudgetRange, TimelineOption } from '../types';
import {
  BUILD_TYPE_GROUPS,
  BUILD_TYPE_HELP,
  MAIN_GOAL_OPTIONS,
  normalizeBuildType,
  normalizeMainGoal,
} from '../lib/intake-options';
import {
  playModalClose,
  playSubmitSuccess,
  playSubmitFailure,
  playErrorShake,
  playSuccessChime
} from '../utils/audio';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Future actual intake endpoint. Currently empty.
// TODO: Connect this to the main Oilgate AI intake flow on oilgateai.com
// This will post the fully filled form data and any uploaded imagery,
// triggering an automated confirmation email to the user.
const OILGATE_INTAKE_ENDPOINT = "";

// Custom hook to persist current IntakeFormData to localStorage as the user types
const useIntakeFormPersistence = (
  formData: IntakeFormData,
  setFormData: React.Dispatch<React.SetStateAction<IntakeFormData>>,
  isOpen: boolean,
  isSubmitted: boolean
) => {
  const isInitializedRef = useRef(false);

  // Restore draft when modal opening state is active
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('oilgate_intake_form_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Map any legacy persisted build type / main goal values onto
          // the current option set so drafts created before the intake
          // cleanup don't reopen blank or invalid.
          const restoredBuildType = normalizeBuildType(parsed.buildType);
          const restoredMainGoal = normalizeMainGoal(parsed.mainGoal);
          setFormData((prev) => ({
            ...prev,
            name: parsed.name ?? prev.name,
            email: parsed.email ?? prev.email,
            phone: parsed.phone ?? prev.phone,
            businessName: parsed.businessName ?? prev.businessName,
            buildType: restoredBuildType || prev.buildType,
            projectDescription: parsed.projectDescription ?? prev.projectDescription,
            files: parsed.files ?? prev.files,
            mainGoal: restoredMainGoal || prev.mainGoal,
            budget: parsed.budget ?? prev.budget,
            timeline: parsed.timeline ?? prev.timeline
          }));
        }
      } catch (e) {
        console.error('Failed to restore form progress from localStorage:', e);
      } finally {
        isInitializedRef.current = true;
      }
    } else {
      // Reset initialization tracker when modal closes, allowing fresh sync on next open
      isInitializedRef.current = false;
    }
  }, [isOpen, setFormData]);

  // Persist form fields into localStorage as the user types
  useEffect(() => {
    if (isSubmitted) {
      try {
        localStorage.removeItem('oilgate_intake_form_progress');
      } catch (e) {
        console.error('Failed to clear progress storage:', e);
      }
      return;
    }

    if (isOpen && isInitializedRef.current) {
      try {
        const isDirty =
          formData.name.trim() !== '' ||
          formData.email.trim() !== '' ||
          formData.phone.trim() !== '' ||
          formData.businessName.trim() !== '' ||
          formData.buildType !== '' ||
          formData.projectDescription.trim() !== '' ||
          formData.files.length > 0 ||
          formData.mainGoal !== '' ||
          formData.budget !== '' ||
          formData.timeline !== '';

        if (isDirty) {
          localStorage.setItem('oilgate_intake_form_progress', JSON.stringify(formData));
        } else {
          localStorage.removeItem('oilgate_intake_form_progress');
        }
      } catch (e) {
        console.error('Failed to save progress storage:', e);
      }
    }
  }, [formData, isOpen, isSubmitted]);
};

// Build type options + help text are sourced from src/lib/intake-options.ts
// (BUILD_TYPE_GROUPS / BUILD_TYPE_HELP) so the form stays consistent with
// future analytics, quote, and project-tracking surfaces.

export const IntakeModal: React.FC<IntakeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<IntakeFormData>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    buildType: '',
    projectDescription: '',
    files: [],
    mainGoal: '',
    budget: '',
    timeline: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof IntakeFormData | 'files', string>>>({});
  const [shakeFields, setShakeFields] = useState<Partial<Record<keyof IntakeFormData | 'files', boolean>>>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<BuildType | ''>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Track user preferences for motion reduction
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Invoke the persistence hook for localStorage sync
  useIntakeFormPersistence(formData, setFormData, isOpen, isSubmitted);

  const [displayedHelpOption, setDisplayedHelpOption] = useState<BuildType | ''>('');

  const activeHelpOption = (isDropdownOpen && hoveredOption) ? hoveredOption : formData.buildType;

  // Clear hoveredOption when dropdown closes
  useEffect(() => {
    if (!isDropdownOpen) {
      setHoveredOption('');
    }
  }, [isDropdownOpen]);

  // Robust effect to synchronize shown help option, ensuring activeHelpOption is correctly evaluated
  useEffect(() => {
    setDisplayedHelpOption(activeHelpOption || '');
  }, [activeHelpOption]);

  const [successViewMode, setSuccessViewMode] = useState<'prototype' | 'backend'>('prototype');
  const [referenceNumber, setReferenceNumber] = useState('');

  useEffect(() => {
    if (isSubmitted && !referenceNumber) {
      setReferenceNumber(`OAI-${Math.floor(1000 + Math.random() * 9000)}`);
    } else if (!isSubmitted && referenceNumber) {
      setReferenceNumber('');
    }
  }, [isSubmitted, referenceNumber]);

  // Focus trap and Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // Intercept close if dirty
        handleAttemptClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Disable body scroll when modal is active
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, formData]);

  // Check if form is dirty (user entered anything in any field)
  const isFormDirty = (): boolean => {
    return (
      formData.name.trim() !== '' ||
      formData.email.trim() !== '' ||
      formData.phone.trim() !== '' ||
      formData.businessName.trim() !== '' ||
      formData.buildType !== '' ||
      formData.projectDescription.trim() !== '' ||
      formData.files.length > 0 ||
      formData.mainGoal !== '' ||
      formData.budget !== '' ||
      formData.timeline !== ''
    );
  };

  const handleAttemptClose = () => {
    playModalClose();
    if (isFormDirty() && !isSubmitted) {
      setShowCloseConfirm(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const confirmClose = () => {
    playModalClose();
    setShowCloseConfirm(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      businessName: '',
      buildType: '',
      projectDescription: '',
      files: [],
      mainGoal: '',
      budget: '',
      timeline: ''
    });
    setErrors({});
    setIsSubmitted(false);
    setShowCloseConfirm(false);
    setIsDropdownOpen(false);
    setHoveredOption('');
  };

  // Live validation
  const validateField = (name: keyof IntakeFormData | 'files', value: any) => {
    const newErrors = { ...errors };

    if (name === 'name') {
      if (!value || String(value).trim() === '') {
        newErrors.name = 'Please enter your name.';
      } else {
        delete newErrors.name;
      }
    }

    if (name === 'email') {
      if (!value || String(value).trim() === '') {
        newErrors.email = 'Please enter your email.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        newErrors.email = 'Please enter a valid email address.';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'phone') {
      const strVal = String(value).trim();
      if (strVal !== '') {
        const digitsCount = strVal.replace(/\D/g, '').length;
        const hasInvalidChar = !/^[+0-9\s\-()]+$/.test(strVal);
        if (digitsCount < 7 || hasInvalidChar) {
          newErrors.phone = 'Please enter a valid phone number or leave this blank.';
        } else {
          delete newErrors.phone;
        }
      } else {
        delete newErrors.phone;
      }
    }

    if (name === 'buildType') {
      if (!value || String(value).trim() === '') {
        newErrors.buildType = 'Please choose what you want Oilgate AI to create.';
      } else {
        delete newErrors.buildType;
      }
    }

    if (name === 'projectDescription') {
      const strVal = String(value).trim();
      if (strVal === '') {
        newErrors.projectDescription = 'Please describe your project idea.';
      } else if (strVal.length < 20) {
        newErrors.projectDescription = 'Please add a little more detail about your project.';
      } else {
        delete newErrors.projectDescription;
      }
    }

    if (name === 'mainGoal') {
      if (!value || String(value).trim() === '') {
        newErrors.mainGoal = 'Please choose your main goal.';
      } else {
        delete newErrors.mainGoal;
      }
    }

    if (name === 'budget') {
      if (!value || String(value).trim() === '') {
        newErrors.budget = 'Please choose a budget range.';
      } else {
        delete newErrors.budget;
      }
    }

    if (name === 'timeline') {
      if (!value || String(value).trim() === '') {
        newErrors.timeline = 'Please choose a timeline.';
      } else {
        delete newErrors.timeline;
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name as keyof IntakeFormData, value);
  };

  // Mock File Drag & Drop + Click Selection upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(selectedFiles);
    }
  };

  const processFiles = (fileList: FileList) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const newFiles: Array<{ name: string; size: number; previewUrl?: string }> = [];
    let fileError = '';

    // Check maximum limit first
    if (formData.files.length + fileList.length > 6) {
      fileError = 'Please upload no more than 6 images.';
      setErrors((prev) => ({ ...prev, files: fileError }));
      return;
    }

    // Check type and size of each file
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!validTypes.includes(file.type)) {
        fileError = 'Please upload PNG, JPG, JPEG, or WEBP files only.';
        break;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        fileError = 'Please keep each image under 10MB.';
        break;
      }
    }

    if (fileError) {
      setErrors((prev) => ({ ...prev, files: fileError }));
      return;
    }

    // Clear any previous files error
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.files;
      return copy;
    });

    Array.from(fileList).forEach((file) => {
      // Create local mock preview URL
      const previewUrl = URL.createObjectURL(file);
      newFiles.push({
        name: file.name,
        size: file.size,
        previewUrl
      });
    });

    if (newFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => {
      const updatedFiles = [...prev.files];
      const removed = updatedFiles.splice(index, 1)[0];
      if (removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return { ...prev, files: updatedFiles };
    });
    // Remove files error since we are removing elements
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.files;
      return copy;
    });
  };

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalErrors: Partial<Record<keyof IntakeFormData | 'files', string>> = {};

    // Validate Required Fields: Name
    if (!formData.name.trim()) {
      finalErrors.name = 'Please enter your name.';
    }

    // Validate Required Fields: Email
    if (!formData.email.trim()) {
      finalErrors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      finalErrors.email = 'Please enter a valid email address.';
    }

    // Validate Optional Fields: Phone (if entered, check format/length > 7)
    if (formData.phone.trim() !== '') {
      const strVal = formData.phone.trim();
      const digitsCount = strVal.replace(/\D/g, '').length;
      const hasInvalidChar = !/^[+0-9\s\-()]+$/.test(strVal);
      if (digitsCount < 7 || hasInvalidChar) {
        finalErrors.phone = 'Please enter a valid phone number or leave this blank.';
      }
    }

    // Validate Required Fields: Build Type
    if (!formData.buildType) {
      finalErrors.buildType = 'Please choose what you want Oilgate AI to create.';
    }

    // Validate Required Fields: Project Description
    if (!formData.projectDescription.trim()) {
      finalErrors.projectDescription = 'Please describe your project idea.';
    } else if (formData.projectDescription.trim().length < 20) {
      finalErrors.projectDescription = 'Please add a little more detail about your project.';
    }

    // Validate Required Fields: Main Goal
    if (!formData.mainGoal) {
      finalErrors.mainGoal = 'Please choose your main goal.';
    }

    // Validate Required Fields: Budget Range
    if (!formData.budget) {
      finalErrors.budget = 'Please choose a budget range.';
    }

    // Validate Required Fields: Timeline
    if (!formData.timeline) {
      finalErrors.timeline = 'Please choose a timeline.';
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      playSubmitFailure();
      playErrorShake();

      // Trigger high-fidelity, non-cartoonish shake animation for fields with errors
      const shakes: Partial<Record<keyof IntakeFormData | 'files', boolean>> = {};
      Object.keys(finalErrors).forEach((key) => {
        shakes[key as keyof IntakeFormData | 'files'] = true;
      });
      setShakeFields(shakes);

      // Reset shake state after animation duration completes
      setTimeout(() => {
        setShakeFields({});
      }, 500);

      // Focus and smooth scroll to the first element with errors
      const firstErrorKey = Object.keys(finalErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Clean any prior state in pre-submission check
    setErrors({});
    setIsSubmitted(true);
    playSubmitSuccess();
    playSuccessChime();
  };

  const getInputClassName = (fieldName: keyof IntakeFormData) => {
    return `w-full bg-[#080b12] border ${
      errors[fieldName]
        ? 'border-red-500/40 hover:border-red-400 focus:border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
        : 'border-oilgate-border hover:border-zinc-700 focus:border-oilgate-blue'
    } focus:outline-none rounded-xl px-4 py-3 text-sm transition-all`;
  };

  const getSelectClassName = (fieldName: keyof IntakeFormData) => {
    return `w-full bg-[#080b12] border ${
      errors[fieldName]
        ? 'border-red-500/40 hover:border-red-400 focus:border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
        : 'border-oilgate-border hover:border-zinc-700 focus:border-oilgate-blue'
    } focus:outline-none rounded-xl px-4 py-3 text-sm transition-all appearance-none cursor-pointer`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 select-none sm:select-text">
          {/* Backdrop Dimmer / Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-dark/85 backdrop-blur-md"
            // Intentionally clicking outside does NOT close the modal!
          />

          {/* Modal Container */}
          <motion.div
            id="intake-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className="relative w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-y-auto rounded-2xl border border-oilgate-border bg-oilgate-card pt-3 px-6 pb-6 md:pt-4 md:px-10 md:pb-10 text-white shadow-2xl shadow-glow-blue flex flex-col z-10"
          >
            {/* Elegant Header X Close Button */}
            <button
              id="modal-close-btn"
              onClick={handleAttemptClose}
              className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Centered Oilgate AI Logo at Top of Modal - leads the entrance animation */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center mb-6 mt-2 md:mt-4 pt-0"
            >
              <OilgateFullLogo className="w-[280px] mt-0 pt-0" style={{ width: '280px', maxWidth: '80%', height: 'auto', marginTop: '0px', paddingTop: '0px' }} />
              <div className="mt-3 text-center" style={{ marginTop: '12px' }}>
                <span className="font-mono text-xs tracking-widest text-oilgate-gold uppercase">
                  Development Intent intake
                </span>
                <p className="text-gray-400 text-xs mt-[6px] max-w-md mx-auto" style={{ marginTop: '6px' }}>
                  Tell us what you want to build. We'll handle the design, engineering, and deployment.
                </p>
              </div>
            </motion.div>

            {/* Form Inner Content - animates smoothly after header logo leads */}
            {!isSubmitted ? (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
              >
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                {/* 1. Personal & Brand Metadata Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {/* Name field */}
                  <motion.div
                    animate={shakeFields.name && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col space-y-2"
                  >
                    <label htmlFor="name" className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.name ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      <User className="w-3.5 h-3.5 mr-1.5 text-oilgate-gold" /> Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Satoshi Nakamoto"
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={getInputClassName('name')}
                    />
                    {errors.name && (
                      <span id="name-error" className="text-xs text-red-400 mt-1" role="alert">
                        {errors.name}
                      </span>
                    )}
                  </motion.div>

                  {/* Email field */}
                  <motion.div
                    animate={shakeFields.email && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col space-y-2"
                  >
                    <label htmlFor="email" className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.email ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-oilgate-gold" /> Email Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. satoshi@oilgateai.com"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={getInputClassName('email')}
                    />
                    {errors.email && (
                      <span id="email-error" className="text-xs text-red-400 mt-1" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </motion.div>

                  {/* Phone field */}
                  <motion.div
                    animate={shakeFields.phone && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col space-y-2"
                  >
                    <label htmlFor="phone" className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.phone ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-oilgate-blue" /> Phone Number <span className="text-gray-600 ml-1">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 (555) 0199"
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={getInputClassName('phone')}
                    />
                    {errors.phone && (
                      <span id="phone-error" className="text-xs text-red-400 mt-1" role="alert">
                        {errors.phone}
                      </span>
                    )}
                  </motion.div>

                  {/* Business Name field */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="businessName" className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-oilgate-blue" /> Business / Brand name <span className="text-gray-600 ml-1">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="e.g. Oilgate Realty"
                      className="w-full bg-[#080b12] border border-oilgate-border hover:border-zinc-700 focus:border-oilgate-blue focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                    />
                  </div>
                </div>

                {/* 2. Project Target Info Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {/* "What do you want Oilgate AI to create?" Dropdown */}
                  <motion.div
                    animate={shakeFields.buildType && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col space-y-2"
                  >
                    <label htmlFor="buildType" className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.buildType ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-oilgate-gold" /> What do you want Oilgate AI to create? <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div ref={dropdownRef} className="relative">
                      <button
                        type="button"
                        id="buildType"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-invalid={errors.buildType ? 'true' : 'false'}
                        aria-describedby={errors.buildType ? 'buildType-error' : undefined}
                        className={`${getSelectClassName('buildType')} flex items-center justify-between text-left select-none`}
                      >
                        <span className={formData.buildType ? 'text-white' : 'text-gray-500'}>
                          {formData.buildType || '--- Select Option ---'}
                        </span>
                        <span className="pointer-events-none flex items-center pr-0.5 text-gray-500">
                          <svg className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-oilgate-gold' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-20 mt-1.5 w-full bg-[#0d1321] border border-oilgate-border rounded-xl shadow-2xl max-h-56 overflow-y-auto focus:outline-none py-1.5 text-sm custom-scrollbar"
                            role="listbox"
                          >
                            {BUILD_TYPE_GROUPS.map((group, groupIdx) => (
                              <React.Fragment key={group.label}>
                                <li
                                  role="presentation"
                                  aria-hidden="true"
                                  className={`px-4 pt-3 pb-1 text-[10px] font-mono font-bold tracking-widest uppercase text-oilgate-gold/80 select-none pointer-events-none ${
                                    groupIdx > 0 ? 'mt-1 border-t border-zinc-800/60' : ''
                                  }`}
                                >
                                  {group.label}
                                </li>
                                {group.options.map(({ value: option }) => (
                                  <li
                                    key={option}
                                    onClick={() => {
                                      setFormData((prev) => ({ ...prev, buildType: option }));
                                      validateField('buildType', option);
                                      setIsDropdownOpen(false);
                                      setHoveredOption('');
                                    }}
                                    onMouseEnter={() => setHoveredOption(option)}
                                    onMouseLeave={() => setHoveredOption('')}
                                    className={`cursor-pointer select-none px-4 py-2 hover:bg-white/5 transition-colors flex items-center justify-between text-xs py-2.5 ${
                                      formData.buildType === option
                                        ? 'bg-oilgate-blue/20 text-white font-medium border-l-2 border-oilgate-blue'
                                        : 'text-gray-300 hover:text-white'
                                    }`}
                                    role="option"
                                    aria-selected={formData.buildType === option}
                                  >
                                    <span>{option}</span>
                                    {formData.buildType === option && (
                                      <Check className="w-3.5 h-3.5 text-[#00c6ff]" />
                                    )}
                                  </li>
                                ))}
                              </React.Fragment>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>

                     {/* Highly responsive help text container designed to work beautifully on both desktop & mobile */}
                     <div className="min-h-[30px] mt-1 flex items-start">
                       <AnimatePresence mode="wait">
                         {displayedHelpOption ? (
                           <motion.p
                             key={displayedHelpOption}
                             initial={{ opacity: 0, y: -2 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -2 }}
                             transition={{ duration: 0.15 }}
                             className="text-[11px] text-zinc-400 font-sans leading-relaxed select-none"
                           >
                             <span className="font-semibold text-oilgate-gold">
                               {displayedHelpOption}:
                             </span>{' '}
                             {BUILD_TYPE_HELP[displayedHelpOption as BuildType]}
                           </motion.p>
                         ) : null}
                       </AnimatePresence>
                     </div>
                    {errors.buildType && (
                      <span id="buildType-error" className="text-xs text-red-400 mt-1" role="alert">
                        {errors.buildType}
                      </span>
                    )}
                  </motion.div>

                  {/* "Main goal" Dropdown */}
                  <motion.div
                    animate={shakeFields.mainGoal && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col space-y-2"
                  >
                    <label htmlFor="mainGoal" className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.mainGoal ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      <Target className="w-3.5 h-3.5 mr-1.5 text-oilgate-blue" /> Main Project Goal <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="mainGoal"
                      name="mainGoal"
                      value={formData.mainGoal}
                      onChange={handleInputChange}
                      aria-invalid={errors.mainGoal ? 'true' : 'false'}
                      aria-describedby={errors.mainGoal ? 'mainGoal-error' : undefined}
                      className={getSelectClassName('mainGoal')}
                    >
                      <option value="" disabled>--- What is the core goal? ---</option>
                      {MAIN_GOAL_OPTIONS.map((goal) => (
                        <option key={goal} value={goal}>{goal}</option>
                      ))}
                    </select>
                    {errors.mainGoal && (
                      <span id="mainGoal-error" className="text-xs text-red-400 mt-1" role="alert">
                        {errors.mainGoal}
                      </span>
                    )}
                  </motion.div>

                  {/* Budget Dropdown */}
                  <motion.div
                    animate={shakeFields.budget && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col space-y-2"
                  >
                    <label htmlFor="budget" className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.budget ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      <DollarSign className="w-3.5 h-3.5 mr-1.5 text-oilgate-blue" /> Budget Range <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      aria-invalid={errors.budget ? 'true' : 'false'}
                      aria-describedby={errors.budget ? 'budget-error' : undefined}
                      className={getSelectClassName('budget')}
                    >
                      <option value="" disabled>--- Select Budget Range ---</option>
                      <option value="Under $500">Under $500</option>
                      <option value="$500 - $1,500">$500 - $1,500</option>
                      <option value="$1,500 - $5,000">$1,500 - $5,000</option>
                      <option value="$5,000+">$5,000+</option>
                      <option value="Not sure yet">Not sure yet</option>
                    </select>
                    {errors.budget && (
                      <span id="budget-error" className="text-xs text-red-400 mt-1" role="alert">
                        {errors.budget}
                      </span>
                    )}
                  </motion.div>

                  {/* Timeline Dropdown */}
                  <motion.div
                    animate={shakeFields.timeline && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col space-y-2"
                  >
                    <label htmlFor="timeline" className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.timeline ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-oilgate-blue" /> Timeline <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      aria-invalid={errors.timeline ? 'true' : 'false'}
                      aria-describedby={errors.timeline ? 'timeline-error' : undefined}
                      className={getSelectClassName('timeline')}
                    >
                      <option value="" disabled>--- Desired Launch ---</option>
                      <option value="ASAP">ASAP</option>
                      <option value="This month">This month</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="Just exploring">Just exploring</option>
                    </select>
                    {errors.timeline && (
                      <span id="timeline-error" className="text-xs text-red-400 mt-1" role="alert">
                        {errors.timeline}
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* 3. Text description area */}
                <motion.div
                  animate={shakeFields.projectDescription && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col space-y-2"
                >
                  <label htmlFor="projectDescription" className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.projectDescription ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-oilgate-gold" /> Project Description <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    placeholder="Tell us about your brand, what features you need, and any inspiration you have..."
                    rows={4}
                    aria-invalid={errors.projectDescription ? 'true' : 'false'}
                    aria-describedby={errors.projectDescription ? 'projectDescription-error' : undefined}
                    className={`w-full bg-[#080b12] border ${
                      errors.projectDescription
                        ? 'border-red-500/40 hover:border-red-400 focus:border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                        : 'border-oilgate-border hover:border-zinc-700 focus:border-oilgate-blue'
                    } focus:outline-none rounded-xl px-4 py-3 text-sm transition-all resize-none`}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs mt-1 gap-1">
                    {errors.projectDescription ? (
                      <span id="projectDescription-error" className="text-red-400 font-medium text-xs flex-shrink-0" role="alert">
                        {errors.projectDescription}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-mono text-[11px] leading-tight select-none">
                        {formData.projectDescription.length === 0 ? (
                          "0 characters • 100+ recommended"
                        ) : formData.projectDescription.length < 20 ? (
                          "Add a little more detail • 100+ recommended"
                        ) : formData.projectDescription.length < 100 ? (
                          "Good start • 100+ recommended"
                        ) : formData.projectDescription.length <= 2000 ? (
                          "Good detail"
                        ) : (
                          "Detailed project notes added"
                        )}
                      </span>
                    )}
                    {formData.projectDescription.length > 0 && (
                      <span className="text-gray-500 font-mono text-[11px] sm:text-right flex-shrink-0 sm:ml-auto leading-tight select-none">
                        {formData.projectDescription.length} characters
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* 4. Drag & Drop Optional File Upload Visualizer */}
                <motion.div
                  id="files"
                  animate={shakeFields.files && !prefersReducedMotion ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col space-y-2"
                >
                  <label className={`text-xs font-semibold uppercase tracking-wider flex items-center transition-colors ${errors.files ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-oilgate-blue" /> Upload images, logos, screenshots, or inspiration <span className="text-gray-600 ml-1">(Optional)</span>
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileBrowser}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      errors.files
                        ? 'border-red-500/40 bg-red-900/5'
                        : dragActive
                        ? 'border-oilgate-blue bg-oilgate-blue/5'
                        : 'border-oilgate-border bg-[#080b12] hover:border-zinc-700 hover:bg-white/[0.01]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".png, .jpg, .jpeg, .webp, image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <FileImage className="w-8 h-8 text-oilgate-blue/80 mb-1" />
                      <p className="text-sm text-gray-300 font-medium">
                        Drag & Drop or <span className="text-oilgate-blue underline">browse files</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports PNG, JPG, JPEG, and WEBP (Multiple allowed, Max 6)
                      </p>
                    </div>
                  </div>
                  {errors.files && (
                    <span id="files-error" className="text-xs text-red-400 mt-1 font-medium" role="alert">
                      {errors.files}
                    </span>
                  )}

                  {/* Local Thumbnail/File Preview Container */}
                  {formData.files.length > 0 && (
                    <div className="mt-3 bg-[#080b12] border border-oilgate-border rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                      <span className="text-[10px] font-mono tracking-wider text-oilgate-gold uppercase font-bold block mb-1">
                        Files Selected ({formData.files.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formData.files.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              {file.previewUrl ? (
                                <img
                                  src={file.previewUrl}
                                  alt="preview"
                                  className="w-8 h-8 rounded object-cover border border-zinc-700 flex-shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              )}
                              <div className="truncate">
                                <p className="font-medium truncate max-w-[120px]">{file.name}</p>
                                <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => removeFile(idx, e)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* 5. CTA Submit Trigger */}
                <div className="pt-4 border-t border-oilgate-border flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-oilgate-blue to-[#00c6ff] text-white hover:opacity-95 transition-all font-semibold font-display tracking-wide uppercase px-8 py-4 rounded-xl shadow-lg hover:shadow-cyan-500/10 cursor-pointer text-sm"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Success Cinematic Screens */
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.98, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center py-4 w-full"
            >
              {/* Interactive Futuristic View Switcher Tab Control */}
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.03] mb-6 max-w-sm w-full mx-auto select-none">
                <button
                  type="button"
                  onClick={() => setSuccessViewMode('prototype')}
                  className={`flex-1 py-2 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                    successViewMode === 'prototype'
                      ? 'bg-oilgate-blue text-white shadow-md shadow-oilgate-blue/10 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  [ PROTOTYPE VIEW ]
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessViewMode('backend')}
                  className={`flex-1 py-2 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                    successViewMode === 'backend'
                      ? 'bg-oilgate-gold/90 text-black shadow-md font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  [ FUTURE BACKEND SPEC ]
                </button>
              </div>

              <AnimatePresence mode="wait">
                {successViewMode === 'prototype' ? (
                  /* TAB 1: PROTOTYPE CLIENT CONFIRMATION SCREEN */
                  <motion.div
                    key="prototype-tab"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    {/* Checkmark Circle Animation */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
                      <Check className="w-8 h-8 text-white stroke-[3px]" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-wide mb-2 max-w-md leading-snug">
                      Form preview complete. Intake connection coming soon.
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-md font-sans">
                      Your intake information has been validated successfully in offline sandboxed mode.
                    </p>

                    {/* Rich Submission Overview */}
                    <div className="w-full mt-6 bg-[#090d16] border border-oilgate-border rounded-xl text-left p-4 sm:p-5 space-y-4 font-mono text-xs max-w-lg shadow-inner">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                        <span className="text-oilgate-gold uppercase tracking-wider font-bold">CLIENT DEMO OVERVIEW</span>
                        <span className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">VALIDATED</span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-gray-300 font-mono">
                        <span className="text-gray-500">CLIENT NAME:</span>
                        <span className="text-white truncate text-right">{formData.name}</span>

                        <span className="text-gray-500">EMAIL ADDRESS:</span>
                        <span className="text-white truncate text-right">{formData.email}</span>

                        <span className="text-gray-500">BUILD SERVICE:</span>
                        <span className="text-white truncate text-right">{formData.buildType}</span>

                        <span className="text-gray-500">BUDGET RANGE:</span>
                        <span className="text-white truncate text-right">{formData.budget}</span>

                        <span className="text-gray-500">TIMELINE:</span>
                        <span className="text-white truncate text-right">{formData.timeline}</span>

                        <span className="text-gray-500">ATTACHMENTS:</span>
                        <span className="text-white text-right">{formData.files.length} uploaded</span>
                      </div>

                      <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-[10px] text-gray-500">
                        <span>SIMULATED UNIQUE VISIT CODE:</span>
                        <span className="text-gray-400 select-all font-bold">{referenceNumber || 'OAI-0000'} (LOCAL)</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* TAB 2: FUTURE REAL BACKEND VERSION PREVIEW SCREEN */
                  <motion.div
                    key="backend-tab"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    {/* Centered full sized Oilgate AI Logo */}
                    <div className="w-[180px] h-[180px] mt-[-30px] pt-0 mb-2 flex items-center justify-center select-none pointer-events-none">
                      <OilgateFullLogo className="w-full h-full drop-shadow-[0_0_15px_rgba(0,114,255,0.15)]" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-wide mb-2 leading-snug">
                      Your Oilgate AI inquiry has been received.
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-md font-sans">
                      We’ll review your project details and follow up soon.
                    </p>

                    <p className="text-zinc-500 font-mono text-[11px] tracking-wider uppercase mt-4 select-all">
                      Inquiry reference: <span className="text-oilgate-gold font-bold">{referenceNumber || 'OAI-####'}</span>
                    </p>

                    {/* Ingestion Specs */}
                    <div className="w-full mt-6 bg-[#04060b] border border-oilgate-border rounded-xl text-left p-4 sm:p-5 space-y-4 font-mono text-xs max-w-lg shadow-inner">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                        <span className="text-zinc-500 font-bold uppercase tracking-wider">PIPELINE ARCHITECTURE SPEC</span>
                        <span className="bg-oilgate-blue/15 border border-oilgate-blue/25 text-oilgate-blue px-2 py-0.5 rounded text-[10px] font-bold">SQL_READY</span>
                      </div>

                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Later, when connecting the real Oilgate AI intake backend, submitting this form will:
                      </p>
                      
                      <ul className="list-disc pl-4 space-y-1.5 text-gray-400 text-[11px] font-sans">
                        <li>
                          Save the client's information to a centralized relational database (<span className="text-zinc-300 font-mono">inquiries</span> table schema, using authenticated encryption).
                        </li>
                        <li>
                          Securely stream image assets to dedicated storage (e.g., Supabase Buckets or Cloud Storage buckets).
                        </li>
                        <li>
                          Trigger cloud function webhooks to dispatch an dynamic SMTP confirmation mailer back to the client.
                        </li>
                      </ul>

                      {/* Mail confirmation block */}
                      <div className="border border-white/5 rounded-lg p-3.5 space-y-2 bg-[#080b12]">
                        <div className="flex justify-between items-center text-[9px] text-gray-500">
                          <span>SMTP DISPATCH SCHEMA PREVIEW:</span>
                          <span className="text-oilgate-gold">TEMPLATE_01</span>
                        </div>
                        <p className="text-white text-[11px] font-semibold font-sans">
                          Subject: <span className="text-gray-300 font-normal">We received your Oilgate AI inquiry</span>
                        </p>
                        <div className="h-px bg-white/5 my-1" />
                        <p className="text-zinc-400 text-[10px] font-sans leading-relaxed text-left font-light max-h-32 overflow-y-auto custom-scrollbar">
                          Thanks for reaching out to Oilgate AI. We received your project inquiry and will review the details you submitted. If we need anything else, we’ll follow up using the contact information you provided.
                          {"\n\n"}
                          In the meantime, you can reply to this email with any additional details, images, examples, or ideas you want us to consider.
                          {"\n\n"}
                          Best,
                          {"\n"}
                          Oilgate AI Admin Team
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset view */}
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSuccessViewMode('prototype');
                }}
                className="mt-6 border border-zinc-800 hover:border-zinc-700 hover:bg-white/5 transition-all text-[11px] text-gray-400 hover:text-white px-5 py-2.5 rounded-lg font-mono cursor-pointer uppercase tracking-wider"
              >
                [ Reset Preview Form ]
              </button>
            </motion.div>
            )}
          </motion.div>

          {/* Close Warning Confirmation Overlay */}
          <AnimatePresence>
            {showCloseConfirm && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowCloseConfirm(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative bg-zinc-950 border border-red-900/40 rounded-xl p-6 text-center max-w-sm w-full shadow-2xl shadow-red-500/5 z-10"
                >
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2 font-display">Close this form?</h4>
                  <p className="text-sm text-gray-400 mb-6">
                    Close this form? Your progress may be lost.
                  </p>
                  
                  <div className="flex justify-center space-x-3 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        playModalClose();
                        setShowCloseConfirm(false);
                      }}
                      className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 hover:bg-white/5 rounded-lg text-gray-300 cursor-pointer"
                    >
                      Keep Editing
                    </button>
                    <button
                      type="button"
                      onClick={confirmClose}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 text-white hover:opacity-90 rounded-lg font-semibold cursor-pointer"
                    >
                      Yes, Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
