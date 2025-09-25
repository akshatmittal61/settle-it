import mongoose from "mongoose";

export class ModelFactory<T = any> {
	private readonly schema: mongoose.Schema<T>;
	public model: mongoose.Model<T>;
	public constructor(name: string, schema: any) {
		this.schema = this.getSchema(schema);
		this.model = this.getModel(name);
	}
	private getSchema(input: any): mongoose.Schema<T> {
		return new mongoose.Schema<T>(input, {
			timestamps: true,
			versionKey: false,
		});
	}
	private getModel(name: string): mongoose.Model<T> {
		return mongoose.models[name] || mongoose.model<T>(name, this.schema);
	}
}
