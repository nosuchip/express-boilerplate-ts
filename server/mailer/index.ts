import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import sgMail from '@sendgrid/mail';
import logger from '@server/logger';
import { Dictionary } from '@server/typing/generics';
import * as handlebars from 'handlebars';
import * as handlebarsLayouts from 'handlebars-layouts';

import config from '../config';

class SendgridMailer {
    private _ready: boolean = false;

    public readonly templteExt = '.html';

    public constructor() {
        if (this._ready) {
            return;
        }

        if (!config.mailerConfig.auth.apiKey) {
            logger.warn(`Mainer not initialize as Sendgrid api key missing`);
            return;
        }

        sgMail.setApiKey(config.mailerConfig.auth.apiKey);

        this.getTemplate('layouts/layout').then((layoutTemplate) => {
            handlebars.registerHelper(handlebarsLayouts(handlebars));
            handlebars.registerPartial('layout', layoutTemplate);

            this._ready = true;
        });
    }

    private async getTemplate(templateName: string): Promise<string> {
        if (!templateName.endsWith(this.templteExt)) {
            templateName = templateName + this.templteExt;
        }

        const templatePath = path.resolve(__dirname, 'templates', templateName);

        try {
            const data = await promisify(fs.readFile)(templatePath);
            return data.toString();
        } catch (error) {
            logger.error(error);
            return '';
        }
    }

    private async renderTemplate(templateName: string, context: Dictionary): Promise<string> {
        const template = await this.getTemplate(templateName);
        const renderTemplateFn = handlebars.compile(template);

        return renderTemplateFn(context);
    }

    public ready = () => this._ready;

    public async send(to: string | string[], subject: string, templateName: string, context: Dictionary) {
        if (!this._ready) {
            return;
        }

        const html = await this.renderTemplate(templateName, context);
        const subj = subject ? subject : await this.renderTemplate(`${templateName}_subject`, context);

        const [response] = await sgMail.send({
            to: to,
            from: config.mailerConfig.from,
            subject: subj,
            html,
        });

        return response;
    }
}

export default new SendgridMailer();
