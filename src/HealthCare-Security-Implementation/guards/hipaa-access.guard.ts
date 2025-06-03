import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../../services/audit.service';

export const HIPAA_MINIMUM_NECESSARY = 'hipaa_minimum_necessary';
export const HIPAA_ROLE_REQUIRED = 