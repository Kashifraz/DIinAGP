"""
Data parsing utilities for CSV and XLSX files.
"""
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd
from django.core.files.storage import default_storage


def infer_type(value: Any) -> str:
    """
    Infer the data type of a value.
    Returns: 'number', 'boolean', 'date', or 'string'
    """
    if pd.isna(value):
        return "string"
    
    # Check if boolean
    if isinstance(value, bool):
        return "boolean"
    
    # Check if number
    if isinstance(value, (int, float)):
        return "number"
    
    # Check if date-like
    if isinstance(value, pd.Timestamp):
        return "date"
    
    # Try to parse as date
    try:
        pd.to_datetime(str(value))
        return "date"
    except:
        pass
    
    # Check if boolean string
    if isinstance(value, str):
        lower_val = value.lower().strip()
        if lower_val in ["true", "false", "yes", "no", "1", "0"]:
            return "boolean"
    
    return "string"


def infer_column_type(series: pd.Series) -> str:
    """
    Infer the most common type for a column.
    Returns the most frequent type, or 'string' if ambiguous.
    """
    type_counts = {"number": 0, "boolean": 0, "date": 0, "string": 0}
    
    for value in series:
        inferred = infer_type(value)
        type_counts[inferred] += 1
    
    # Return the most common type
    max_type = max(type_counts, key=type_counts.get)
    
    # If most values are strings, return string
    if type_counts["string"] > len(series) * 0.5:
        return "string"
    
    return max_type


def parse_csv_file(file_path: str, sample_size: int = 100) -> Dict[str, Any]:
    """
    Parse a CSV file and return schema and sample data.
    
    Args:
        file_path: Path to the CSV file in storage or file-like object
        sample_size: Number of rows to include in sample
    
    Returns:
        Dict with 'schema', 'num_rows', and 'sample_data'
    """
    try:
        # Read CSV with pandas
        # Limit rows for large files (will count total rows separately if needed)
        df = pd.read_csv(
            file_path,
            nrows=10000,
            encoding="utf-8",
            on_bad_lines="skip",
        )
        
        # Infer schema
        schema = {}
        for col in df.columns:
            schema[col] = infer_column_type(df[col])
        
        num_rows = len(df)
        
        # Get sample (first N rows)
        sample_df = df.head(sample_size)
        
        # Convert to JSON-serializable format
        sample_data = sample_df.replace({pd.NaT: None}).to_dict(orient="records")
        
        # Handle pd.NA if available (pandas 1.0+)
        try:
            sample_data = [
                {k: None if (hasattr(pd, "NA") and v is pd.NA) else v for k, v in record.items()}
                for record in sample_data
            ]
        except:
            pass
        
        # Convert any remaining non-serializable types
        for record in sample_data:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None
                elif isinstance(value, pd.Timestamp):
                    record[key] = value.isoformat()
                elif hasattr(value, "item"):  # NumPy scalar types
                    try:
                        record[key] = value.item()
                    except (ValueError, AttributeError):
                        record[key] = None
        
        return {
            "schema": schema,
            "num_rows": int(num_rows),
            "sample_data": sample_data,
        }
    except Exception as e:
        raise ValueError(f"Failed to parse CSV file: {str(e)}")


def parse_xlsx_file(file_path: str, sheet_name: Optional[str] = None, sample_size: int = 100) -> Dict[str, Any]:
    """
    Parse an XLSX file and return schema and sample data.
    
    Args:
        file_path: Path to the XLSX file in storage
        sheet_name: Name of sheet to read (defaults to first sheet)
        sample_size: Number of rows to include in sample
    
    Returns:
        Dict with 'schema', 'num_rows', and 'sample_data'
    """
    try:
        # Read XLSX with pandas
        if sheet_name:
            df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=10000)
        else:
            # Read first sheet by default
            xls = pd.ExcelFile(file_path)
            if len(xls.sheet_names) == 0:
                raise ValueError("Excel file has no sheets")
            df = pd.read_excel(file_path, sheet_name=xls.sheet_names[0], nrows=10000)
        
        # Infer schema
        schema = {}
        for col in df.columns:
            schema[col] = infer_column_type(df[col])
        
        num_rows = len(df)
        
        # Get sample (first N rows)
        sample_df = df.head(sample_size)
        
        # Convert to JSON-serializable format
        sample_data = sample_df.replace({pd.NaT: None}).to_dict(orient="records")
        
        # Handle pd.NA if available (pandas 1.0+)
        try:
            sample_data = [
                {k: None if (hasattr(pd, "NA") and v is pd.NA) else v for k, v in record.items()}
                for record in sample_data
            ]
        except:
            pass
        
        # Convert any remaining non-serializable types
        for record in sample_data:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None
                elif isinstance(value, pd.Timestamp):
                    record[key] = value.isoformat()
                elif hasattr(value, "item"):  # NumPy scalar types
                    try:
                        record[key] = value.item()
                    except (ValueError, AttributeError):
                        record[key] = None
        
        return {
            "schema": schema,
            "num_rows": int(num_rows),
            "sample_data": sample_data,
        }
    except Exception as e:
        raise ValueError(f"Failed to parse XLSX file: {str(e)}")


def parse_file(uploaded_file_obj) -> Dict[str, Any]:
    """
    Parse an uploaded file based on its extension.
    
    Args:
        uploaded_file_obj: UploadedFile model instance
    
    Returns:
        Dict with 'schema', 'num_rows', and 'sample_data'
    """
    file_ext = Path(uploaded_file_obj.filename).suffix.lower()
    
    # Get file from storage
    storage_file = default_storage.open(uploaded_file_obj.storage_key, mode="rb")
    
    try:
        if file_ext == ".csv":
            # For CSV, we can read from file object or path
            # If default_storage is local, use path for efficiency
            if hasattr(default_storage, "path"):
                try:
                    file_path = default_storage.path(uploaded_file_obj.storage_key)
                    return parse_csv_file(file_path)
                except NotImplementedError:
                    # Storage doesn't support path(), read from file object
                    storage_file.seek(0)
                    return parse_csv_file(storage_file)
            else:
                storage_file.seek(0)
                return parse_csv_file(storage_file)
        elif file_ext == ".xlsx":
            # For XLSX, pandas needs a path or file-like object
            if hasattr(default_storage, "path"):
                try:
                    file_path = default_storage.path(uploaded_file_obj.storage_key)
                    return parse_xlsx_file(file_path)
                except NotImplementedError:
                    # Storage doesn't support path(), need to save temporarily
                    import tempfile
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_file:
                        storage_file.seek(0)
                        tmp_file.write(storage_file.read())
                        tmp_path = tmp_file.name
                    try:
                        result = parse_xlsx_file(tmp_path)
                    finally:
                        import os
                        if os.path.exists(tmp_path):
                            os.unlink(tmp_path)
                    return result
            else:
                # Use path if available
                file_path = default_storage.path(uploaded_file_obj.storage_key)
                return parse_xlsx_file(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
    finally:
        storage_file.close()

